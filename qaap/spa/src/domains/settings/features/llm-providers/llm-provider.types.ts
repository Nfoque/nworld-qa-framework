export type LlmProviderStatus = "active" | "error" | "disabled";
export type UiProviderStatus = "connected" | "not_configured" | "error";

export interface LlmProviderDto {
  id: string;
  tenantId: string;
  providerName: string;
  displayName: string;
  baseUrl: string;
  hasApiKey: boolean;
  availableModels: string[];
  isDefault: boolean;
  status: LlmProviderStatus;
  statusMessage: string | null;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLlmProviderInput {
  providerName: string;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  availableModels?: string[];
  isDefault?: boolean;
}

export interface UpdateLlmProviderInput {
  id: string;
  displayName?: string;
  baseUrl?: string;
  apiKey?: string;
  availableModels?: string[];
  isDefault?: boolean;
  status?: LlmProviderStatus;
  statusMessage?: string;
}

export interface TestLlmProviderInput {
  providerId?: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
}

export interface TestLlmProviderResult {
  success: boolean;
  models: string[];
  error: string | null;
}

export interface ModelMatrixEntry {
  provider: string;
  model: string;
}

export type ModelMatrix = Record<string, ModelMatrixEntry>;

export interface LlmProvider {
  id: string | null;
  providerName: string;
  displayName: string;
  baseUrl: string;
  hasApiKey: boolean;
  availableModels: string[];
  isDefault: boolean;
  status: UiProviderStatus;
  statusMessage: string | null;
  lastTestedAt: string | null;
  logo: string;
  color: string;
  descriptionKey: string;
}

export interface ProviderCatalogEntry {
  id: string;
  name: string;
  logo: string;
  color: string;
  defaultBaseUrl: string;
  defaultModels: string[];
  descriptionKey: string;
}

export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "A",
    color: "#D97706",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModels: ["Claude Sonnet 4", "Claude Haiku", "Claude Opus"],
    descriptionKey: "llmProviders.providers.anthropic.description",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "O",
    color: "#10A37F",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModels: ["GPT-4o", "GPT-4o Mini", "o3-mini"],
    descriptionKey: "llmProviders.providers.openai.description",
  },
  {
    id: "google",
    name: "Google AI",
    logo: "G",
    color: "#4285F4",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModels: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
    descriptionKey: "llmProviders.providers.google.description",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    logo: "L",
    color: "#888888",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModels: ["Llama 3", "CodeLlama", "Mistral"],
    descriptionKey: "llmProviders.providers.ollama.description",
  },
  {
    id: "litellm",
    name: "LiteLLM",
    logo: "Li",
    color: "#6366F1",
    defaultBaseUrl: "http://localhost:4000/v1",
    defaultModels: ["Proxy"],
    descriptionKey: "llmProviders.providers.litellm.description",
  },
];

export const TASK_TYPES = [
  {
    key: "extraction",
    labelKey: "llmProviders.taskTypes.extraction",
    descriptionKey: "llmProviders.taskDescriptions.extraction",
  },
  {
    key: "classification",
    labelKey: "llmProviders.taskTypes.classification",
    descriptionKey: "llmProviders.taskDescriptions.classification",
  },
  {
    key: "generation",
    labelKey: "llmProviders.taskTypes.generation",
    descriptionKey: "llmProviders.taskDescriptions.generation",
  },
  {
    key: "review",
    labelKey: "llmProviders.taskTypes.review",
    descriptionKey: "llmProviders.taskDescriptions.review",
  },
  {
    key: "codification",
    labelKey: "llmProviders.taskTypes.codification",
    descriptionKey: "llmProviders.taskDescriptions.codification",
  },
  {
    key: "failure_analysis",
    labelKey: "llmProviders.taskTypes.failure_analysis",
    descriptionKey: "llmProviders.taskDescriptions.failure_analysis",
  },
  {
    key: "chat",
    labelKey: "llmProviders.taskTypes.chat",
    descriptionKey: "llmProviders.taskDescriptions.chat",
  },
] as const;
