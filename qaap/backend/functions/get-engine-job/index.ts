import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import type { EngineJobRow, EngineJobStepRow } from "../_shared/engine-jobs.ts";
import { toJobDto } from "../_shared/engine-jobs.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { jobId } = body;

  if (!jobId) return error(req, "MISSING_FIELD: jobId required", 400);

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(jobId)) return error(req, "INVALID_UUID", 400);

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .select("*, creator:user_profiles!created_by(name, email, avatar_url)")
    .eq("id", jobId)
    .eq("tenant_id", auth.tenantId)
    .single();

  if (dbErr) return error(req, "JOB_NOT_FOUND", 404);
  const job = data as EngineJobRow;

  const { data: stepsData } = await auth.serviceClient
    .from("engine_job_steps")
    .select("*")
    .eq("job_id", jobId)
    .order("position", { ascending: true });

  return ok(req, toJobDto(job, (stepsData ?? []) as EngineJobStepRow[]));
});
