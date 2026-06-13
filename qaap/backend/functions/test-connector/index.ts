import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";
import { validateGitHubToken } from "../_shared/connectors/github.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { connectorId, credentials: rawCredentials } = body;
  if (!connectorId) return error("MISSING_FIELD: connectorId required", 400);

  const { data: connector } = await auth.serviceClient
    .from("connector_configs")
    .select("*")
    .eq("connector_id", connectorId)
    .eq("tenant_id", auth.tenantId)
    .single();

  const token = rawCredentials?.token ?? connector?.credentials?.token;
  if (!token) return error("NO_CREDENTIALS", 400);

  if (connectorId !== "github") {
    return error(
      `Test not implemented for connector: ${connectorId}`,
      400,
    );
  }

  const result = await validateGitHubToken(token);

  let newStatus: string;
  let statusMessage: string | null = null;

  if (!result.tokenValid) {
    newStatus = "error";
    statusMessage = "Invalid token — check your Personal Access Token.";
  } else {
    newStatus = "active";
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

    if (updateErr) return error(updateErr.message, 500);
  }

  return ok({
    connectorId,
    status: newStatus,
    statusMessage,
    result,
  });
});
