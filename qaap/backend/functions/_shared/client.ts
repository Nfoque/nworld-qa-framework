import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function createSupabaseClient(req: Request): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    },
  );
}

export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export async function getAuthUser(
  client: SupabaseClient,
  req: Request,
): Promise<User | null> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user;
}
