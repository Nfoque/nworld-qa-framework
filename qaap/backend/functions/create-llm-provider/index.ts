import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { toLlmProviderDto } from "../_shared/llm-providers/dto.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

const VALID_PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "ollama",
  "litellm",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const {
    providerName,
    displayName,
    baseUrl,
    apiKey,
    availableModels,
    isDefault,
  } = body;

  if (!providerName || !displayName || !baseUrl) {
    return error(
      req,
      "MISSING_FIELDS: providerName, displayName, baseUrl required",
      400,
    );
  }

  if (!VALID_PROVIDERS.includes(providerName)) {
    return error(
      req,
      `INVALID_PROVIDER: must be one of ${VALID_PROVIDERS.join(", ")}`,
      400,
    );
  }

  if (isDefault) {
    await auth.serviceClient
      .from("llm_provider_configs")
      .update({ is_default: false })
      .eq("tenant_id", auth.tenantId)
      .eq("is_default", true);
  }

  const { data, error: dbErr } = await auth.serviceClient
    .from("llm_provider_configs")
    .insert({
      tenant_id: auth.tenantId,
      provider_name: providerName,
      display_name: displayName,
      base_url: baseUrl,
      api_key: apiKey ?? null,
      available_models: availableModels ?? [],
      is_default: isDefault ?? false,
      status: apiKey ? "active" : "disabled",
    })
    .select()
    .single();

  if (dbErr) {
    if (dbErr.code === "23505") {
      return error(req, "PROVIDER_ALREADY_EXISTS", 409);
    }
    return error(req, dbErr.message, 500);
  }

  return ok(req, toLlmProviderDto(data));
});
