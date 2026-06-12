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

  if (!["superadmin", "admin", "editor"].includes(resolved.role)) {
    return error("FORBIDDEN", 403);
  }

  const body = await req.json();
  const { selectedSources } = body;

  if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
    return error("MISSING_FIELDS: selectedSources (non-empty array) required", 400);
  }

  const { data, error: dbErr } = await serviceClient
    .from("engine_jobs")
    .insert({
      tenant_id: resolved.tenantId,
      status: "queued",
      selected_sources: selectedSources,
      created_by: user.id,
    })
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);

  return ok({
    id: data.id,
    tenantId: data.tenant_id,
    status: data.status,
    selectedSources: data.selected_sources,
    createdBy: data.created_by,
    createdAt: data.created_at,
  });
});
