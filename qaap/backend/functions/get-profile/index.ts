import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "GET" && req.method !== "POST")
    return error(req, "METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error(req, "UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();
  const { data: profile, error: profileErr } = await serviceClient
    .from("user_profiles")
    .select("*, tenant:tenants(*)")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) return error(req, "PROFILE_NOT_FOUND", 404);

  if (!profile.avatar_url) {
    const avatarFromMeta =
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      null;
    if (avatarFromMeta) {
      await serviceClient
        .from("user_profiles")
        .update({ avatar_url: avatarFromMeta })
        .eq("id", user.id);
      profile.avatar_url = avatarFromMeta;
    }
  }

  return ok(req, {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    tenantId: profile.tenant_id,
    tenant: profile.tenant
      ? {
        id: profile.tenant.id,
        slug: profile.tenant.slug,
        name: profile.tenant.name,
        branding: profile.tenant.branding,
      }
      : null,
    createdAt: profile.created_at,
  });
});
