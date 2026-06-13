import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { toConnectorDto } from "../_shared/connectors/dto.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const {
    connectorId,
    category,
    displayName,
    description,
    config,
    credentials,
  } = body;

  if (!connectorId || !category || !displayName) {
    return error(
      req,
      "MISSING_FIELDS: connectorId, category, displayName required",
      400,
    );
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("connector_configs")
    .insert({
      tenant_id: auth.tenantId,
      connector_id: connectorId,
      category,
      display_name: displayName,
      description: description ?? "",
      config: config ?? {},
      credentials: credentials ?? null,
      status: credentials ? "active" : "disabled",
    })
    .select()
    .single();

  if (dbErr) {
    if (dbErr.code === "23505") {
      return error(req, "CONNECTOR_ALREADY_EXISTS", 409);
    }
    return error(req, dbErr.message, 500);
  }

  return ok(req, toConnectorDto(data));
});
