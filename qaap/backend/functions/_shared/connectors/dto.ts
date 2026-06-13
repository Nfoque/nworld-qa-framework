export interface ConnectorRow {
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

export function toConnectorDto(row: ConnectorRow) {
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
