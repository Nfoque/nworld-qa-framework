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

  const jobs = (data ?? []).map((row: Record<string, unknown>) => {
    const creator = row.creator as Record<string, unknown> | null;
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
    };
  });

  return ok(jobs);
});
