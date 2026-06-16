import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
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

  const { scenarioId, description, gherkinText } = body;
  if (!scenarioId) return error(req, "MISSING_FIELD: scenarioId required", 400);

  const update: Record<string, unknown> = {};
  if (description !== undefined) update.description = description;
  if (gherkinText !== undefined) update.gherkin_text = gherkinText;

  if (Object.keys(update).length === 0) {
    return error(req, "NO_FIELDS_TO_UPDATE", 400);
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("test_scenarios")
    .update(update)
    .eq("id", scenarioId)
    .eq("tenant_id", auth.tenantId)
    .select(
      "id, title, description, gherkin_text, confidence, rationale, source_model, review_status, sort_order, category, version, created_at",
    )
    .single();

  if (dbErr) return error(req, dbErr.message, 500);
  if (!data) return error(req, "NOT_FOUND", 404);

  return ok(req, data);
});
