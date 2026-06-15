import type { SupabaseClient } from "@supabase/supabase-js";

interface ResolvedTenant {
  tenantId: string;
  role: string;
}

export async function resolveTenantId(
  serviceClient: SupabaseClient,
  userId: string,
  req: Request,
): Promise<ResolvedTenant | null> {
  const { data } = await serviceClient
    .from("user_profiles")
    .select("tenant_id, role")
    .eq("id", userId)
    .single();

  if (!data) return null;

  const overrideTenantId = req.headers.get("x-tenant-id");

  if (data.role === "superadmin" && overrideTenantId) {
    return { tenantId: overrideTenantId, role: data.role };
  }

  if (!data.tenant_id) return null;

  return { tenantId: data.tenant_id, role: data.role };
}
