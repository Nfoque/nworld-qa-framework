import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { toConnectorDto } from "../_shared/connectors/dto.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "PUT") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { id, ...fields } = body;
  if (!id) return error(req, "MISSING_FIELD: id required", 400);

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
    return error(req, "NO_FIELDS_TO_UPDATE", 400);
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("connector_configs")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", auth.tenantId)
    .select()
    .single();

  if (dbErr) return error(req, dbErr.message, 500);
  if (!data) return error(req, "NOT_FOUND", 404);

  return ok(req, toConnectorDto(data));
});
