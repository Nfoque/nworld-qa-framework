import { authenticateAndResolveTenant, requireRole } from "../_shared/auth.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const denied = requireRole(req, auth, "superadmin", "admin", "editor");
  if (denied) return denied;

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { providerId, providerName, baseUrl } = body;
  let { apiKey } = body;

  if (providerId && !apiKey) {
    const { data: row } = await auth.serviceClient
      .from("llm_provider_configs")
      .select("api_key")
      .eq("id", providerId)
      .eq("tenant_id", auth.tenantId)
      .single();
    if (row?.api_key) apiKey = row.api_key;
  }

  if (!baseUrl || !apiKey) {
    return error(req, "MISSING_FIELDS: baseUrl, apiKey required", 400);
  }

  const modelsUrl = `${baseUrl.replace(/\/$/, "")}/models`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (providerName === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  let models: string[] = [];
  let testError: string | null = null;

  try {
    const resp = await fetch(modelsUrl, { headers });
    if (!resp.ok) {
      const text = await resp.text();
      testError = `${resp.status}: ${text.slice(0, 200)}`;
    } else {
      const json = await resp.json();
      models = (json.data ?? json)
        .map((m: { id?: string; name?: string }) => m.id ?? m.name)
        .filter(Boolean);
    }
  } catch (e) {
    testError = e instanceof Error ? e.message : "Connection failed";
  }

  if (providerId) {
    await auth.serviceClient
      .from("llm_provider_configs")
      .update({
        status: testError ? "error" : "active",
        status_message: testError,
        available_models: testError ? undefined : models,
        last_tested_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .eq("tenant_id", auth.tenantId);
  }

  return ok(req, {
    success: !testError,
    models,
    error: testError,
  });
});
