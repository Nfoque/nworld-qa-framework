export interface LlmProviderRow {
  id: string;
  tenant_id: string;
  provider_name: string;
  display_name: string;
  base_url: string;
  api_key: string | null;
  available_models: string[];
  is_default: boolean;
  status: string;
  status_message: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toLlmProviderDto(row: LlmProviderRow) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    providerName: row.provider_name,
    displayName: row.display_name,
    baseUrl: row.base_url,
    hasApiKey: !!row.api_key,
    availableModels: row.available_models ?? [],
    isDefault: row.is_default,
    status: row.status,
    statusMessage: row.status_message,
    lastTestedAt: row.last_tested_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
