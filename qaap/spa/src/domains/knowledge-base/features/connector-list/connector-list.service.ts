import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  Connector,
  ConnectorCatalogEntry,
  ConnectorDto,
  CreateConnectorInput,
  TestConnectorInput,
  TestConnectorResult,
  UiConnectorStatus,
  UpdateConnectorInput,
} from "./connector-list.types";

import { invokeFunction } from "@/shared/config/supabase";
import { useTenant } from "@/shared/tenant/tenant-provider";

const CONNECTORS_KEY = ["connectors"] as const;
const FN_LIST = "get-connectors";
const FN_CREATE = "create-connector";
const FN_UPDATE = "update-connector";
const FN_DELETE = "delete-connector";
const FN_TEST = "test-connector";

const CONNECTOR_CATALOG: ConnectorCatalogEntry[] = [
  {
    connectorId: "github",
    category: "code-repo",
    name: "GitHub",
    description:
      "Connect repositories to analyze code, PRs, and workflows for test generation.",
  },
  {
    connectorId: "jira",
    category: "task-manager",
    name: "Jira",
    description:
      "Import user stories, bugs, and acceptance criteria as context for test plans.",
  },
  {
    connectorId: "figma",
    category: "document-source",
    name: "Figma",
    description:
      "Extract UI designs and flows to generate visual regression and E2E tests.",
  },
  {
    connectorId: "supabase-storage",
    category: "document-source",
    name: "Supabase Storage",
    description:
      "Connect to Supabase Storage buckets to analyze uploaded code repositories, documents, and files.",
  },
];

function mapStatus(dto: ConnectorDto): UiConnectorStatus {
  if (dto.status === "active") return "connected";
  if (dto.status === "error") return "error";
  return "not_configured";
}

function formatRelativeTime(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mergeWithCatalog(dtos: ConnectorDto[]): Connector[] {
  const configsByConnectorId = new Map(dtos.map((d) => [d.connectorId, d]));

  return CONNECTOR_CATALOG.map((entry) => {
    const dto = configsByConnectorId.get(entry.connectorId);
    if (dto) {
      return {
        id: dto.id,
        connectorId: dto.connectorId,
        category: dto.category,
        name: dto.displayName,
        description: dto.description,
        status: mapStatus(dto),
        config: dto.config,
        lastSync: formatRelativeTime(dto.lastSyncedAt),
        error:
          dto.status === "error"
            ? (dto.statusMessage ?? "Connection error")
            : undefined,
      };
    }
    return {
      id: null,
      connectorId: entry.connectorId,
      category: entry.category,
      name: entry.name,
      description: entry.description,
      status: "not_configured" as UiConnectorStatus,
      config: {},
      lastSync: null,
    };
  });
}

export function useConnectors() {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: [...CONNECTORS_KEY, activeTenantId],
    queryFn: async () => {
      const dtos = await invokeFunction<ConnectorDto[]>(FN_LIST, {
        method: "GET",
      });
      return mergeWithCatalog(dtos);
    },
    enabled: !!activeTenantId,
  });
}

export function useCreateConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConnectorInput) =>
      invokeFunction<ConnectorDto>(FN_CREATE, {
        method: "POST",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}

export function useUpdateConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateConnectorInput) =>
      invokeFunction<ConnectorDto>(FN_UPDATE, {
        method: "PUT",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}

export function useDeleteConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      invokeFunction<{ deleted: boolean }>(FN_DELETE, {
        method: "POST",
        body: { id },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}

export function useTestConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TestConnectorInput) =>
      invokeFunction<TestConnectorResult>(FN_TEST, {
        method: "POST",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}
