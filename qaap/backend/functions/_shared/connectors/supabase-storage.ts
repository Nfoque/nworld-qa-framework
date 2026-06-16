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
}

export async function validateSupabaseStorage(
  projectUrl: string,
  serviceRoleKey: string,
): Promise<SupabaseStorageValidationResult> {
  const baseUrl = projectUrl.replace(/\/+$/, "");
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

