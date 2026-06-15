import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "GET") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  const { data, error: dbErr } = await auth.serviceClient
    .from("test_plans")
    .select(
      "id, name, description, modality, status, target_framework, engine_job_id, created_by, created_at, scenarios:test_scenarios(count)",
    )
    .eq("tenant_id", auth.tenantId)
    .order("created_at", { ascending: false });

  if (dbErr) return error(req, dbErr.message, 500);

  const rows = data ?? [];
  const creatorIds = [
    ...new Set(
      rows.map((r: Record<string, unknown>) => r.created_by).filter(Boolean),
    ),
  ] as string[];

  const profileMap: Record<
    string,
    { name: string | null; avatar_url: string | null }
  > = {};
  if (creatorIds.length > 0) {
    const { data: profiles } = await auth.serviceClient
      .from("user_profiles")
      .select("id, name, avatar_url")
      .in("id", creatorIds);

    for (const p of profiles ?? []) {
      profileMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
    }
  }

  const plans = rows.map((row: Record<string, unknown>) => {
    const profile = profileMap[row.created_by as string];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      modality: row.modality,
      status: row.status,
      target_framework: row.target_framework,
      engine_job_id: row.engine_job_id,
      created_by: row.created_by,
      created_at: row.created_at,
      created_by_name: profile?.name ?? null,
      created_by_avatar: profile?.avatar_url ?? null,
      scenario_count: ((row.scenarios as { count: number }[])?.[0]?.count) ?? 0,
    };
  });

  return ok(req, plans);
});
