import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
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
  const { selectedSources } = body;

  if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
    return error(
      req,
      "MISSING_FIELD: selectedSources (non-empty array) required",
      400,
    );
  }

  const validStructure = selectedSources.every(
    (s: unknown) =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Record<string, unknown>).connector === "string" &&
      Array.isArray((s as Record<string, unknown>).items) &&
      ((s as Record<string, unknown>).items as unknown[]).length > 0 &&
      ((s as Record<string, unknown>).items as unknown[]).every(
        (i: unknown) => typeof i === "string",
      ),
  );
  if (!validStructure) {
    return error(
      req,
      "INVALID_STRUCTURE: each selectedSource must have connector (string) and items (string[])",
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

  if (dbErr) return error(req, dbErr.message, 500);

  return ok(req, {
    id: data.id,
    tenantId: data.tenant_id,
    status: data.status,
    selectedSources: data.selected_sources,
    createdBy: data.created_by,
    createdAt: data.created_at,
  });
});
