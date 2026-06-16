import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

interface ProposalScenario {
  id: string;
  name: string;
  description?: string;
  gherkin: string;
  confidence: number;
  rationale: string;
  review_status?: "pending" | "approved" | "rejected" | "modified";
  source_refs?: { chunk_id: string; source: string; type: string }[];
}

interface ProposalTestArea {
  id: string;
  name: string;
  scenarios: ProposalScenario[];
}

interface ProposalFeature {
  id: string;
  name: string;
  description: string;
  test_areas: ProposalTestArea[];
}

interface ProposalPayload {
  features: ProposalFeature[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;

  const { jobId, proposal } = body as {
    jobId?: string;
    proposal?: ProposalPayload;
  };

  if (!jobId || !proposal?.features) {
    return error(req, "MISSING_FIELD: jobId and proposal required", 400);
  }

  // Verify job belongs to tenant and is paused
  const { data: job, error: jobErr } = await auth.serviceClient
    .from("engine_jobs")
    .select("id, status, tenant_id")
    .eq("id", jobId)
    .eq("tenant_id", auth.tenantId)
    .single();

  if (jobErr || !job) return error(req, "JOB_NOT_FOUND", 404);
  if (job.status !== "paused") {
    return error(
      req,
      `CONFLICT: job status is '${job.status}', expected 'paused'`,
      409,
    );
  }

  // Read project type from step 5 output to determine modality + framework
  const { data: proposalStep } = await auth.serviceClient
    .from("engine_job_steps")
    .select("output")
    .eq("job_id", jobId)
    .eq("step_type", "generate_proposal")
    .single();

  const project = (proposalStep?.output as Record<string, unknown>)
    ?.project as Record<string, string> | undefined;
  const projectType = project?.type ?? "";

  const MODALITY_MAP: Record<string, { modality: string; framework: string }> =
    {
      mobile_ios: { modality: "ios", framework: "xcuitest" },
      mobile_android: { modality: "android", framework: "espresso" },
      web_spa: { modality: "web", framework: "playwright" },
      web_ssr: { modality: "web", framework: "playwright" },
      backend_api: { modality: "api", framework: "karate" },
    };

  const resolved = MODALITY_MAP[projectType] ?? {
    modality: "web",
    framework: "playwright",
  };

  const testPlanIds: string[] = [];
  let totalScenarios = 0;

  for (const feature of proposal.features) {
    const { data: planRow, error: planErr } = await auth.serviceClient
      .from("test_plans")
      .insert({
        tenant_id: auth.tenantId,
        name: feature.name,
        description: feature.description || "",
        modality: resolved.modality,
        status: "approved",
        target_framework: resolved.framework,
        engine_job_id: jobId,
        created_by: auth.userId,
      })
      .select("id")
      .single();

    if (planErr || !planRow) {
      return error(req, `PLAN_INSERT_FAILED: ${planErr?.message}`, 500);
    }

    testPlanIds.push(planRow.id);

    // Collect non-rejected scenarios across all areas
    const scenarioRows: Record<string, unknown>[] = [];
    let sortOrder = 0;
    for (const area of feature.test_areas) {
      for (const scenario of area.scenarios) {
        const status = scenario.review_status ?? "pending";
        if (status === "rejected") continue;
        scenarioRows.push({
          tenant_id: auth.tenantId,
          test_plan_id: planRow.id,
          title: scenario.name,
          gherkin_text: scenario.gherkin,
          description: scenario.description || null,
          confidence: scenario.confidence,
          rationale: scenario.rationale || "",
          review_status: status,
          sort_order: sortOrder++,
          category: area.name || null,
        });
      }
    }

    if (scenarioRows.length > 0) {
      const { error: scenErr } = await auth.serviceClient
        .from("test_scenarios")
        .insert(scenarioRows);

      if (scenErr) {
        return error(req, `SCENARIOS_INSERT_FAILED: ${scenErr.message}`, 500);
      }
      totalScenarios += scenarioRows.length;
    }
  }

  // Mark job as completed
  const { error: updateErr } = await auth.serviceClient
    .from("engine_jobs")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", jobId);

  if (updateErr) {
    return error(req, `JOB_UPDATE_FAILED: ${updateErr.message}`, 500);
  }

  return ok(req, { testPlanIds, totalScenarios });
});
