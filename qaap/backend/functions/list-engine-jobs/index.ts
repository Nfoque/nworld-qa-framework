import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import type { EngineJobRow, EngineJobStepRow } from "../_shared/engine-jobs.ts";
import { toJobDto } from "../_shared/engine-jobs.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .select("*, creator:user_profiles!created_by(name, email, avatar_url)")
    .eq("tenant_id", auth.tenantId)
    .order("created_at", { ascending: false });

  if (dbErr) return error(dbErr.message, 500);

  const rows = (data ?? []) as EngineJobRow[];
  const jobIds = rows.map((r) => r.id);

  const { data: allSteps } = jobIds.length
    ? await auth.serviceClient
      .from("engine_job_steps")
      .select("*")
      .in("job_id", jobIds)
      .order("position", { ascending: true })
    : { data: [] };

  const stepsByJob = new Map<string, EngineJobStepRow[]>();
  for (const s of (allSteps ?? []) as EngineJobStepRow[]) {
    const jid = s.job_id;
    if (!stepsByJob.has(jid)) stepsByJob.set(jid, []);
    stepsByJob.get(jid)!.push(s);
  }

  const jobs = rows.map((row) => toJobDto(row, stepsByJob.get(row.id) ?? []));

  return ok(jobs);
});
