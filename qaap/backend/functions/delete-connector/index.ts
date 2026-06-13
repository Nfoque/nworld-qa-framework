import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  if (!["superadmin", "admin"].includes(auth.role)) {
    return error("FORBIDDEN", 403);
  }

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { id } = body;
  if (!id) return error("MISSING_FIELD: id required", 400);

  const { error: dbErr } = await auth.serviceClient
    .from("connector_configs")
    .delete()
    .eq("id", id)
    .eq("tenant_id", auth.tenantId);

  if (dbErr) return error(dbErr.message, 500);

  return ok({ deleted: true });
});
