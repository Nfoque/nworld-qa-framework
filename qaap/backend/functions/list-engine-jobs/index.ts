import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";
import { resolveTenantId } from "../_shared/tenant.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error("UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();
  const resolved = await resolveTenantId(serviceClient, user.id, req);
  if (!resolved) return error("NO_TENANT", 403);

  const { data, error: dbErr } = await serviceClient
    .from("engine_jobs")
    .select("*, creator:user_profiles!created_by(name, email, avatar_url)")
    .eq("tenant_id", resolved.tenantId)
    .order("created_at", { ascending: false });

  if (dbErr) return error(dbErr.message, 500);

  const jobIds = (data ?? []).map((r: Record<string, unknown>) => r.id);

  const { data: allSteps } = jobIds.length
    ? await serviceClient
        .from("engine_job_steps")
        .select("*")
        .in("job_id", jobIds)
        .order("position", { ascending: true })
    : { data: [] };

  const stepsByJob = new Map<string, Record<string, unknown>[]>();
  for (const s of allSteps ?? []) {
    const jid = s.job_id as string;
    if (!stepsByJob.has(jid)) stepsByJob.set(jid, []);
    stepsByJob.get(jid)!.push(s);
  }

  const jobs = (data ?? []).map((row: Record<string, unknown>) => {
    const creator = row.creator as Record<string, unknown> | null;
    const jobSteps = (stepsByJob.get(row.id as string) ?? []).map((s) => ({
      id: s.id,
      position: s.position,
      stepType: s.step_type,
      status: s.status,
      input: s.input,
      output: s.output,
      meta: s.meta,
      errorMessage: s.error_message,
      startedAt: s.started_at,
      completedAt: s.completed_at,
    }));
    return {
      id: row.id,
      tenantId: row.tenant_id,
      status: row.status,
      selectedSources: row.selected_sources,
      createdBy: row.created_by,
      createdByName: creator?.name ?? creator?.email ?? null,
      createdByAvatar: creator?.avatar_url ?? null,
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      steps: jobSteps,
    };
  });

  return ok(jobs);
});
