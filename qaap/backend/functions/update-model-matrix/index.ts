import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

const VALID_TASK_TYPES = [
  "extraction",
  "classification",
  "generation",
  "review",
  "codification",
  "failure_analysis",
  "chat",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "PUT") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { matrix } = body;

  if (!matrix || typeof matrix !== "object") {
    return error(req, "MISSING_FIELD: matrix required", 400);
  }

  for (const key of Object.keys(matrix)) {
    if (!VALID_TASK_TYPES.includes(key)) {
      return error(req, `INVALID_TASK_TYPE: ${key}`, 400);
    }
    const entry = matrix[key];
    if (!entry?.provider || !entry?.model) {
      return error(
        req,
        `INVALID_ENTRY: ${key} requires provider and model`,
        400,
      );
    }
  }

  const { error: dbErr } = await auth.serviceClient
    .from("tenants")
    .update({ llm_model_matrix: matrix })
    .eq("id", auth.tenantId);

  if (dbErr) return error(req, dbErr.message, 500);

  return ok(req, { matrix });
});
