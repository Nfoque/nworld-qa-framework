import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";
import { resolveTenantId } from "../_shared/tenant.ts";
import { testGitHub } from "../_shared/connectors/github.ts";
import type { GitHubTestResult } from "../_shared/connectors/github.ts";

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
  const { connectorId } = body;
  if (!connectorId) return error("MISSING_FIELD: connectorId required", 400);

  const { data: connector, error: dbErr } = await serviceClient
    .from("connector_configs")
    .select("*")
    .eq("connector_id", connectorId)
    .eq("tenant_id", resolved.tenantId)
    .single();

  if (dbErr || !connector) return error("CONNECTOR_NOT_FOUND", 404);
  if (!connector.credentials?.token) return error("NO_CREDENTIALS", 400);

  let result: GitHubTestResult;
  let newStatus: string;
  let statusMessage: string | null = null;

  if (connector.connector_id === "github") {
    result = await testGitHub(connector.credentials.token, connector.config);

    if (!result.tokenValid) {
      newStatus = "error";
      statusMessage = "Invalid token — check your Personal Access Token.";
    } else {
      const inaccessible = result.repos.filter((r) => !r.accessible);
      if (inaccessible.length > 0) {
        newStatus = "error";
        statusMessage = `Cannot access: ${
          inaccessible.map((r) => `${r.name} (${r.error})`).join(", ")
        }`;
      } else {
        newStatus = "active";
        statusMessage = null;
      }
    }
  } else {
    return error(
      `Test not implemented for connector: ${connector.connector_id}`,
      400,
    );
  }

  await serviceClient
    .from("connector_configs")
    .update({
      status: newStatus,
      status_message: statusMessage,
      last_tested_at: new Date().toISOString(),
    })
    .eq("id", connector.id);

  return ok({
    connectorId: connector.connector_id,
    status: newStatus,
    statusMessage,
    result,
  });
});
