import {
  createServiceClient,
  createSupabaseClient,
  getAuthUser,
} from "../_shared/client.ts";
import { error, ok, parseBody, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const client = createSupabaseClient(req);
  const user = await getAuthUser(client, req);
  if (!user) return error(req, "UNAUTHORIZED", 401);

  const body = await parseBody(req);
  if (body instanceof Response) return body;
  const { avatarUrl } = body;

  if (!avatarUrl || typeof avatarUrl !== "string") {
    return error(req, "MISSING_FIELD: avatarUrl required", 400);
  }

  if (!avatarUrl.startsWith("https://")) {
    return error(req, "INVALID_AVATAR_URL: must use https:// protocol", 400);
  }

  const serviceClient = createServiceClient();
  const { error: updateErr } = await serviceClient
    .from("user_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateErr) return error(req, updateErr.message, 500);

  return ok(req, { updated: true });
});
