import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  if (!["superadmin", "admin", "editor"].includes(auth.role)) {
    return error("FORBIDDEN", 403);
  }

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { selectedSources } = body;

  if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
    return error(
      "MISSING_FIELD: selectedSources (non-empty array) required",
      400,
    );
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("engine_jobs")
    .insert({
      tenant_id: auth.tenantId,
      status: "queued",
      selected_sources: selectedSources,
      created_by: auth.userId,
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
