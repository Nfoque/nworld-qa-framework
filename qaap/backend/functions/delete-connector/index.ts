import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { id } = body;
  if (!id) return error(req, "MISSING_FIELD: id required", 400);

  const { data, error: dbErr } = await auth.serviceClient
    .from("connector_configs")
    .delete()
    .eq("id", id)
    .eq("tenant_id", auth.tenantId)
    .select("id")
    .single();

  if (dbErr || !data) return error(req, "NOT_FOUND", 404);

  return ok(req, { deleted: true });
});
