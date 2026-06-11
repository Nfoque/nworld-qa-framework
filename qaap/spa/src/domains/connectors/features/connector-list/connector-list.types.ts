export type ConnectorCategory =
  | "task-manager"
  | "document-source"
  | "code-repo"
  | "test-runner"
  | "notification";

export type ConnectorStatus = "active" | "error" | "disabled";

export interface ConnectorDto {
  id: string;
  tenantId: string;
  connectorId: string;
  category: ConnectorCategory;
  displayName: string;
  description: string;
  config: Record<string, unknown>;
  hasCredentials: boolean;
  status: ConnectorStatus;
  statusMessage: string | null;
  lastSyncedAt: string | null;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectorInput {
  connectorId: string;
  category: ConnectorCategory;
  displayName: string;
  description?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

export interface UpdateConnectorInput {
  id: string;
  displayName?: string;
  description?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  status?: ConnectorStatus;
  statusMessage?: string;
}

export type UiConnectorStatus = "connected" | "not_configured" | "error";

export interface ConnectorCatalogEntry {
  connectorId: string;
  category: ConnectorCategory;
  name: string;
  description: string;
}

export interface Connector {
  id: string | null;
  connectorId: string;
  category: ConnectorCategory;
  name: string;
  description: string;
  status: UiConnectorStatus;
  config: Record<string, unknown>;
  lastSync: string | null;
  error?: string;
}
