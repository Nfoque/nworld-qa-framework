import { validateUpstreamUrl } from "../url-safety.ts";

export interface SupabaseBucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
}

export interface SupabaseStorageValidationResult {
  valid: boolean;
  projectUrl?: string;
  buckets: SupabaseBucket[];
  error?: string;
}

// Allowed hostname suffixes for self-hosted + managed Supabase. Keep the list
// short and explicit — anything that doesn't match is rejected before we ship
// the service-role key out in an Authorization header.
const SUPABASE_HOST_SUFFIXES = [".supabase.co", ".supabase.in"];

export async function validateSupabaseStorage(
  projectUrl: string,
  serviceRoleKey: string,
): Promise<SupabaseStorageValidationResult> {
  const safe = validateUpstreamUrl(projectUrl, {
    allowedHostSuffixes: SUPABASE_HOST_SUFFIXES,
  });
  if (!safe.ok) {
    return { valid: false, buckets: [], error: safe.reason };
  }

  const baseUrl = safe.url.toString().replace(/\/+$/, "");
  const headers = {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(`${baseUrl}/storage/v1/bucket`, { headers });

    if (!res.ok) {
      return { valid: false, buckets: [] };
    }

    const data = await res.json();
    const buckets: SupabaseBucket[] = data.map(
      (b: Record<string, unknown>) => ({
        id: b.id as string,
        name: b.name as string,
        public: b.public as boolean,
        createdAt: b.created_at as string,
      }),
    );

    return { valid: true, projectUrl: baseUrl, buckets };
  } catch {
    return { valid: false, buckets: [] };
  }
}
