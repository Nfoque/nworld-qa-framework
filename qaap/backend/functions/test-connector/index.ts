import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";
import { resolveTenantId } from "../_shared/tenant.ts";
import { validateGitHubToken } from "../_shared/connectors/github.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return error("METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error("UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();
  const resolved = await resolveTenantId(serviceClient, user.id, req);
  if (!resolved) return error("NO_TENANT", 403);

  const body = await req.json();
  const { connectorId, credentials: rawCredentials } = body;
  if (!connectorId) return error("MISSING_FIELD: connectorId required", 400);

  const { data: connector } = await serviceClient
    .from("connector_configs")
    .select("*")
    .eq("connector_id", connectorId)
    .eq("tenant_id", resolved.tenantId)
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
    await serviceClient
      .from("connector_configs")
      .update({
        status: newStatus,
        status_message: statusMessage,
        last_tested_at: new Date().toISOString(),
      })
      .eq("id", connector.id);
  }

  return ok({
    connectorId,
    status: newStatus,
    statusMessage,
    result,
  });
});
