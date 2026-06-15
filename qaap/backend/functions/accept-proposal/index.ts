import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

interface ProposalScenario {
  id: string;
  title: string;
  gherkin_text: string;
  confidence: number;
  rationale: string;
  source_model: string;
  review_status: "pending" | "approved" | "rejected" | "modified";
  sort_order: number;
}

interface ProposalTestArea {
  name?: string;
  scenarios: ProposalScenario[];
}

interface ProposalContextSource {
  source_type: string;
  config: Record<string, unknown>;
}

interface ProposalTestPlan {
  id: string;
  name: string;
  description: string;
  modality: string;
  target_framework: string;
  context_sources: ProposalContextSource[];
  test_areas: ProposalTestArea[];
}

interface ProposalPayload {
  test_plans: ProposalTestPlan[];
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

  if (!jobId || !proposal?.test_plans) {
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

  const testPlanIds: string[] = [];
  let totalScenarios = 0;

  for (const plan of proposal.test_plans) {
    // Insert test_plan
    const { data: planRow, error: planErr } = await auth.serviceClient
      .from("test_plans")
      .insert({
        tenant_id: auth.tenantId,
        name: plan.name,
        description: plan.description || "",
        modality: plan.modality || "web",
        status: "approved",
        target_framework: plan.target_framework || "playwright",
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
    for (const area of plan.test_areas) {
      for (const scenario of area.scenarios) {
        if (scenario.review_status === "rejected") continue;
        scenarioRows.push({
          tenant_id: auth.tenantId,
          test_plan_id: planRow.id,
          title: scenario.title,
          gherkin_text: scenario.gherkin_text,
          confidence: scenario.confidence,
          rationale: scenario.rationale || "",
          source_model: scenario.source_model,
          review_status: scenario.review_status,
          sort_order: scenario.sort_order ?? 0,
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

    // Insert context_sources
    const sourceRows = (plan.context_sources ?? []).map((cs) => ({
      tenant_id: auth.tenantId,
      test_plan_id: planRow.id,
      source_type: cs.source_type,
      config: cs.config ?? {},
      sync_status: "synced",
    }));

    if (sourceRows.length > 0) {
      const { error: srcErr } = await auth.serviceClient
        .from("context_sources")
        .insert(sourceRows);

      if (srcErr) {
        return error(req, `SOURCES_INSERT_FAILED: ${srcErr.message}`, 500);
      }
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
