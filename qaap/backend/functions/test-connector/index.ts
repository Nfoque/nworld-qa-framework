import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";
import { validateGitHubToken } from "../_shared/connectors/github.ts";
import { validateSupabaseStorage } from "../_shared/connectors/supabase-storage.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { connectorId, credentials: rawCredentials } = body;
  if (!connectorId) {
    return error(req, "MISSING_FIELD: connectorId required", 400);
  }

  const { data: connector } = await auth.serviceClient
    .from("connector_configs")
    .select("*")
    .eq("connector_id", connectorId)
    .eq("tenant_id", auth.tenantId)
    .single();

  let result: Record<string, unknown>;
  let newStatus: string;
  let statusMessage: string | null = null;

  if (connectorId === "github") {
    const token = rawCredentials?.token ?? connector?.credentials?.token;
    if (!token) return error(req, "NO_CREDENTIALS", 400);

    const ghResult = await validateGitHubToken(token);
    result = ghResult as unknown as Record<string, unknown>;

    if (!ghResult.tokenValid) {
      newStatus = "error";
      statusMessage = "Invalid token — check your Personal Access Token.";
    } else {
      newStatus = "active";
    }
  } else if (connectorId === "supabase-storage") {
    const projectUrl = rawCredentials?.projectUrl ??
      connector?.credentials?.projectUrl;
    const serviceRoleKey = rawCredentials?.serviceRoleKey ??
      connector?.credentials?.serviceRoleKey;
    if (!projectUrl || !serviceRoleKey) {
      return error(
        req,
        "NO_CREDENTIALS: projectUrl and serviceRoleKey required",
        400,
      );
    }

    const sbResult = await validateSupabaseStorage(
      projectUrl as string,
      serviceRoleKey as string,
    );
    result = sbResult as unknown as Record<string, unknown>;

    if (!sbResult.valid) {
      newStatus = "error";
      statusMessage =
        "Invalid credentials — check your project URL and service role key.";
    } else {
      newStatus = "active";
    }
  } else {
    return error(
      req,
      `Test not implemented for connector: ${connectorId}`,
      400,
    );
  }

  if (connector) {
    const { error: updateErr } = await auth.serviceClient
      .from("connector_configs")
      .update({
        status: newStatus,
        status_message: statusMessage,
        last_tested_at: new Date().toISOString(),
      })
      .eq("id", connector.id);

    if (updateErr) return error(req, updateErr.message, 500);
  }

  return ok(req, { connectorId, status: newStatus, statusMessage, result });
});
