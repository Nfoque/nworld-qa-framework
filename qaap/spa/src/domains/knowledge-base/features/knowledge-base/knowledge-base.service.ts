import { useQuery } from "@tanstack/react-query";

import type { TestConnectorResult } from "@/domains/knowledge-base/features/connector-list/connector-list.types";
import { invokeFunction } from "@/shared/config/supabase";
import { useTenant } from "@/shared/tenant/tenant-provider";

const FN_TEST = "test-connector";

export function useKnowledgeBaseDetails(connectorId: string, enabled: boolean) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ["knowledge-base", "details", connectorId, activeTenantId],
    queryFn: () =>
      invokeFunction<TestConnectorResult>(FN_TEST, {
        method: "POST",
        body: { connectorId },
      }),
    enabled: enabled && !!activeTenantId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function getSelectedRepos(
  config: Record<string, unknown>,
): string[] {
  const repos = config.selectedRepos;
  return Array.isArray(repos)
    ? repos.filter((r): r is string => typeof r === "string")
    : [];
}
