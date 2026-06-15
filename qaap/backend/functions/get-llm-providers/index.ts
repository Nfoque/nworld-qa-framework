import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import {
  type LlmProviderRow,
  toLlmProviderDto,
} from "../_shared/llm-providers/dto.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "GET") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const [providersResult, tenantResult] = await Promise.all([
    auth.serviceClient
      .from("llm_provider_configs")
      .select("*")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: true }),
    auth.serviceClient
      .from("tenants")
      .select("llm_model_matrix")
      .eq("id", auth.tenantId)
      .single(),
  ]);

  if (providersResult.error) return error(req, providersResult.error.message, 500);

  return ok(req, {
    providers: (providersResult.data as LlmProviderRow[]).map(toLlmProviderDto),
    matrix: (tenantResult.data?.llm_model_matrix as Record<string, unknown>) ?? {},
  });
});
