import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let _activeTenantId: string | null = localStorage.getItem(
  "qaap:activeTenantId",
);

export function setActiveTenantHeader(tenantId: string | null) {
  _activeTenantId = tenantId;
}

export async function invokeFunction<T>(
  name: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
  },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (_activeTenantId) {
    headers["x-tenant-id"] = _activeTenantId;
  }

  const { data, error } = await supabase.functions.invoke(name, {
    method: options?.method,
    body: options?.body,
    headers,
  });
  if (error) throw error;
  return data as T;
}
