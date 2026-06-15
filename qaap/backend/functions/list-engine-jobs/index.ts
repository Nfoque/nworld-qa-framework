import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import type { EngineJobRow, EngineJobStepRow } from "../_shared/engine-jobs.ts";
import { toJobDto } from "../_shared/engine-jobs.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .select(
      "*, creator:user_profiles!created_by(name, email, avatar_url), steps:engine_job_steps(*)",
    )
    .eq("tenant_id", auth.tenantId)
    .order("created_at", { ascending: false });

  if (dbErr) return error(req, dbErr.message, 500);

  const jobs = (data ?? []).map(
    (row: EngineJobRow & { steps?: EngineJobStepRow[] }) => {
      const steps = (row.steps ?? []).sort(
        (a: EngineJobStepRow, b: EngineJobStepRow) => a.position - b.position,
      );
      return toJobDto(row, steps);
    },
  );

  return ok(req, jobs);
});
