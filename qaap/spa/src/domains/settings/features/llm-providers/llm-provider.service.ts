import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateLlmProviderInput,
  LlmProvider,
  LlmProviderDto,
  ModelMatrix,
  TestLlmProviderInput,
  TestLlmProviderResult,
  UiProviderStatus,
  UpdateLlmProviderInput,
} from "./llm-provider.types";
import { PROVIDER_CATALOG } from "./llm-provider.types";

import { invokeFunction } from "@/shared/config/supabase";
import { useTenant } from "@/shared/tenant/tenant-provider";

const LLM_PROVIDERS_KEY = ["llm-providers"] as const;
const FN_LIST = "get-llm-providers";
const FN_CREATE = "create-llm-provider";
const FN_UPDATE = "update-llm-provider";
const FN_DELETE = "delete-llm-provider";
const FN_TEST = "test-llm-provider";
const FN_MATRIX = "update-model-matrix";

function mapStatus(dto: LlmProviderDto): UiProviderStatus {
  if (dto.status === "active") return "connected";
  if (dto.status === "error") return "error";
  return "not_configured";
}

function mergeWithCatalog(dtos: LlmProviderDto[]): LlmProvider[] {
  const configsByProvider = new Map(dtos.map((d) => [d.providerName, d]));

  return PROVIDER_CATALOG.map((entry) => {
    const dto = configsByProvider.get(entry.id);
    if (dto) {
      return {
        id: dto.id,
        providerName: dto.providerName,
        displayName: dto.displayName,
        baseUrl: dto.baseUrl,
        hasApiKey: dto.hasApiKey,
        availableModels:
          dto.availableModels.length > 0
            ? dto.availableModels
            : entry.defaultModels,
        isDefault: dto.isDefault,
        status: mapStatus(dto),
        statusMessage: dto.statusMessage,
        lastTestedAt: dto.lastTestedAt,
        logo: entry.logo,
        color: entry.color,
        descriptionKey: entry.descriptionKey,
      };
    }
    return {
      id: null,
      providerName: entry.id,
      displayName: entry.name,
      baseUrl: entry.defaultBaseUrl,
      hasApiKey: false,
      availableModels: entry.defaultModels,
      isDefault: false,
      status: "not_configured" as UiProviderStatus,
      statusMessage: null,
      lastTestedAt: null,
      logo: entry.logo,
      color: entry.color,
      descriptionKey: entry.descriptionKey,
    };
  });
}

interface LlmProvidersResponse {
  providers: LlmProviderDto[];
  matrix: ModelMatrix;
}

export function useLlmProviders() {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: [...LLM_PROVIDERS_KEY, activeTenantId],
    queryFn: async () => {
      const res = await invokeFunction<LlmProvidersResponse>(FN_LIST, {
        method: "GET",
      });
      return {
        providers: mergeWithCatalog(res.providers),
        matrix: res.matrix,
      };
    },
    enabled: !!activeTenantId,
  });
}

export function useCreateLlmProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLlmProviderInput) =>
      invokeFunction<LlmProviderDto>(FN_CREATE, {
        method: "POST",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: LLM_PROVIDERS_KEY }),
  });
}

export function useUpdateLlmProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLlmProviderInput) =>
      invokeFunction<LlmProviderDto>(FN_UPDATE, {
        method: "PUT",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: LLM_PROVIDERS_KEY }),
  });
}

export function useDeleteLlmProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      invokeFunction<{ deleted: boolean }>(FN_DELETE, {
        method: "POST",
        body: { id },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: LLM_PROVIDERS_KEY }),
  });
}

export function useTestLlmProvider() {
  return useMutation({
    mutationFn: (input: TestLlmProviderInput) =>
      invokeFunction<TestLlmProviderResult>(FN_TEST, {
        method: "POST",
        body: input as unknown as Record<string, unknown>,
      }),
  });
}

export function useUpdateModelMatrix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matrix: ModelMatrix) =>
      invokeFunction<{ matrix: ModelMatrix }>(FN_MATRIX, {
        method: "PUT",
        body: { matrix },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: LLM_PROVIDERS_KEY }),
  });
}
