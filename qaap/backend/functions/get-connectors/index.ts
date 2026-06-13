import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";
import { resolveTenantId } from "../_shared/tenant.ts";

interface ConnectorRow {
  id: string;
  tenant_id: string;
  connector_id: string;
  category: string;
  display_name: string;
  description: string;
  config: Record<string, unknown>;
  credentials: Record<string, unknown> | null;
  status: string;
  status_message: string | null;
  last_synced_at: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

function toDto(row: ConnectorRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    connectorId: row.connector_id,
    category: row.category,
    displayName: row.display_name,
    description: row.description,
    config: row.config,
    hasCredentials: !!row.credentials,
    status: row.status,
    statusMessage: row.status_message,
    lastSyncedAt: row.last_synced_at,
    lastTestedAt: row.last_tested_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") return error("METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error("UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();
  const resolved = await resolveTenantId(serviceClient, user.id, req);
  if (!resolved) return error("NO_TENANT", 403);

  const { data, error: dbErr } = await serviceClient
    .from("connector_configs")
    .select("*")
    .eq("tenant_id", resolved.tenantId)
    .order("created_at", { ascending: true });

  if (dbErr) return error(dbErr.message, 500);

  return ok((data as ConnectorRow[]).map(toDto));
});
