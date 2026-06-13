import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import {
  type ConnectorRow,
  toConnectorDto,
} from "../_shared/connectors/dto.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") return error("METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const { data, error: dbErr } = await auth.serviceClient
    .from("connector_configs")
    .select("*")
    .eq("tenant_id", auth.tenantId)
    .order("created_at", { ascending: true });

  if (dbErr) return error(dbErr.message, 500);

  return ok((data as ConnectorRow[]).map(toConnectorDto));
});
