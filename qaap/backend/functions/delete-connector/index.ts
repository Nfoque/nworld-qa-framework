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

  if (!["superadmin", "admin"].includes(resolved.role)) {
    return error("FORBIDDEN", 403);
  }

  const body = await req.json();
  const { id } = body;
  if (!id) return error("MISSING_FIELD: id required", 400);

  const { error: dbErr } = await serviceClient
    .from("connector_configs")
    .delete()
    .eq("id", id)
    .eq("tenant_id", resolved.tenantId);

  if (dbErr) return error(dbErr.message, 500);

  return ok({ deleted: true });
});
