import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") return error("METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error("UNAUTHORIZED", 401);

  const serviceClient = createServiceClient();

  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") {
    return error("FORBIDDEN", 403);
  }

  const { data: tenants, error: dbErr } = await serviceClient
    .from("tenants")
    .select("id, slug, name, created_at")
    .order("name", { ascending: true });

  if (dbErr) return error(dbErr.message, 500);

  return ok(
    (tenants ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      createdAt: t.created_at,
    })),
  );
});
