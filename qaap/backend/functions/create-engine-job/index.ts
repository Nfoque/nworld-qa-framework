import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { selectedSources } = body;

  if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
    return error(
      req,
      "MISSING_FIELD: selectedSources (non-empty array) required",
      400,
    );
  }

  const validStructure = selectedSources.every(
    (s: unknown) =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Record<string, unknown>).connector === "string" &&
      Array.isArray((s as Record<string, unknown>).items) &&
      ((s as Record<string, unknown>).items as unknown[]).length > 0 &&
      ((s as Record<string, unknown>).items as unknown[]).every(
        (i: unknown) => typeof i === "string",
      ),
  );
  if (!validStructure) {
    return error(
      req,
      "INVALID_STRUCTURE: each selectedSource must have connector (string) and items (string[])",
      400,
    );
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .insert({
      tenant_id: auth.tenantId,
      status: "queued",
      selected_sources: selectedSources,
      created_by: auth.userId,
    })
    .select()
    .single();

  if (dbErr) return error(req, dbErr.message, 500);

  // Pre-create the 5 pipeline steps as `pending` (positions 1..5). The SPA
  // renders the full pipeline from the moment the job is queued, and the worker's
  // tick() finds the first pending step. The worker also has an idempotent
  // "ensure 5 steps exist" safety net, but creation happens here for explicitness.
  const STEP_SEQUENCE = [
    { position: 1, step_type: "collect" },
    { position: 2, step_type: "extract_features" },
    { position: 3, step_type: "extract_plans" },
    { position: 4, step_type: "extract_scenarios" },
    { position: 5, step_type: "generate_proposal" },
  ];

  const { error: stepsErr } = await auth.serviceClient
    .from("engine_job_steps")
    .insert(
      STEP_SEQUENCE.map((s) => ({
        job_id: data.id,
        position: s.position,
        step_type: s.step_type,
        status: "pending",
      })),
    );

  if (stepsErr) {
    return error(req, `STEPS_INIT_FAILED: ${stepsErr.message}`, 500);
  }

  // Enqueue the job for the standalone engine worker (pgmq). The worker polls
  // `engine_jobs_queue` and drives the job through its 5 steps. If this fails the
  // job row exists but no worker would pick it up, so surface the error.
  const { error: queueErr } = await auth.serviceClient.rpc(
    "enqueue_engine_job",
    { p_job_id: data.id, p_tenant_id: data.tenant_id },
  );

  if (queueErr) return error(req, `ENQUEUE_FAILED: ${queueErr.message}`, 500);

  return ok(req, {
    id: data.id,
    tenantId: data.tenant_id,
    status: data.status,
    selectedSources: data.selected_sources,
    createdBy: data.created_by,
    createdAt: data.created_at,
  });
});
