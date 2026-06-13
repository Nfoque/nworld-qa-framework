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

  const body = await req.json();
  const { jobId } = body;

  if (!jobId) return error("MISSING_FIELDS: jobId required", 400);

  const { data, error: dbErr } = await serviceClient
    .from("engine_jobs")
    .select("*, creator:user_profiles!created_by(name, email, avatar_url)")
    .eq("id", jobId)
    .eq("tenant_id", resolved.tenantId)
    .single();

  if (dbErr) return error("JOB_NOT_FOUND", 404);

  const { data: stepsData } = await serviceClient
    .from("engine_job_steps")
    .select("*")
    .eq("job_id", jobId)
    .order("position", { ascending: true });

  const creator = data.creator as Record<string, unknown> | null;
  const steps = (stepsData ?? []).map((s: Record<string, unknown>) => ({
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

  return ok({
    id: data.id,
    tenantId: data.tenant_id,
    status: data.status,
    selectedSources: data.selected_sources,
    createdBy: data.created_by,
    createdByName: creator?.name ?? creator?.email ?? null,
    createdByAvatar: creator?.avatar_url ?? null,
    errorMessage: data.error_message,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    steps,
  });
});
