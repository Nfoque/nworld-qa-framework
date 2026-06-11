import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";
import { resolveTenantId } from "../_shared/tenant.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "PUT") return error("METHOD_NOT_ALLOWED", 405);

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
  const { id, ...fields } = body;
  if (!id) return error("MISSING_FIELD: id required", 400);

  const update: Record<string, unknown> = {};
  if (fields.displayName !== undefined) {
    update.display_name = fields.displayName;
  }
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.config !== undefined) update.config = fields.config;
  if (fields.credentials !== undefined) update.credentials = fields.credentials;
  if (fields.status !== undefined) update.status = fields.status;
  if (fields.statusMessage !== undefined) {
    update.status_message = fields.statusMessage;
  }

  if (Object.keys(update).length === 0) {
    return error("NO_FIELDS_TO_UPDATE", 400);
  }

  const { data, error: dbErr } = await serviceClient
    .from("connector_configs")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", resolved.tenantId)
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);
  if (!data) return error("NOT_FOUND", 404);

  return ok({
    id: data.id,
    tenantId: data.tenant_id,
    connectorId: data.connector_id,
    category: data.category,
    displayName: data.display_name,
    description: data.description,
    config: data.config,
    hasCredentials: !!data.credentials,
    status: data.status,
    statusMessage: data.status_message,
    lastSyncedAt: data.last_synced_at,
    lastTestedAt: data.last_tested_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
});
