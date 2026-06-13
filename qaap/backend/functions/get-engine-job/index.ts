import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import type { EngineJobRow, EngineJobStepRow } from "../_shared/engine-jobs.ts";
import { toJobDto } from "../_shared/engine-jobs.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { jobId } = body;

  if (!jobId) return error("MISSING_FIELD: jobId required", 400);

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .select("*, creator:user_profiles!created_by(name, email, avatar_url)")
    .eq("id", jobId)
    .eq("tenant_id", auth.tenantId)
    .single();

  if (dbErr) return error("JOB_NOT_FOUND", 404);
  const job = data as EngineJobRow;

  const { data: stepsData } = await auth.serviceClient
    .from("engine_job_steps")
    .select("*")
    .eq("job_id", jobId)
    .order("position", { ascending: true });

  return ok(toJobDto(job, (stepsData ?? []) as EngineJobStepRow[]));
});
