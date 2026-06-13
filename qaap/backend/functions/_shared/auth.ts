import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "./client.ts";
import { error } from "./response.ts";
import { resolveTenantId } from "./tenant.ts";

export interface AuthResult {
  tenantId: string;
  userId: string;
  role: string;
  serviceClient: SupabaseClient;
}

export async function authenticateAndResolveTenant(
  req: Request,
): Promise<AuthResult | Response> {
  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error("UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();
  const resolved = await resolveTenantId(serviceClient, user.id, req);
  if (!resolved) return error("NO_TENANT", 403);

  return {
    tenantId: resolved.tenantId,
    userId: user.id,
    role: resolved.role,
    serviceClient,
  };
}
