import { authenticateAndResolveTenant } from "../_shared/auth.ts";
import { error, ok, preflight } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return error(req, "METHOD_NOT_ALLOWED", 405);

  const auth = await authenticateAndResolveTenant(req);
  if (auth instanceof Response) return auth;

  let planId: string | undefined;
  try {
    const body = await req.json();
    planId = body.planId;
  } catch {
    return error(req, "INVALID_BODY", 400);
  }
  if (!planId) return error(req, "MISSING_FIELD: planId required", 400);

  const { data: plan, error: planErr } = await auth.serviceClient
    .from("test_plans")
    .select("*")
    .eq("id", planId)
    .eq("tenant_id", auth.tenantId)
    .single();

  if (planErr || !plan) return error(req, "PLAN_NOT_FOUND", 404);

  // Creator profile
  let createdByName: string | null = null;
  let createdByAvatar: string | null = null;
  if (plan.created_by) {
    const { data: profile } = await auth.serviceClient
      .from("user_profiles")
      .select("name, avatar_url")
      .eq("id", plan.created_by)
      .single();
    if (profile) {
      createdByName = profile.name;
      createdByAvatar = profile.avatar_url;
    }
  }

  const { data: scenarios, error: scenErr } = await auth.serviceClient
    .from("test_scenarios")
    .select(
      "id, title, description, gherkin_text, confidence, rationale, source_model, review_status, sort_order, category, version, created_at",
    )
    .eq("test_plan_id", planId)
    .eq("tenant_id", auth.tenantId)
    .order("sort_order", { ascending: true });

  if (scenErr) return error(req, scenErr.message, 500);

  const { data: sources, error: srcErr } = await auth.serviceClient
    .from("context_sources")
    .select("id, source_type, config, sync_status, last_synced_at")
    .eq("test_plan_id", planId)
    .eq("tenant_id", auth.tenantId);

  if (srcErr) return error(req, srcErr.message, 500);

  return ok(req, {
    ...plan,
    created_by_name: createdByName,
    created_by_avatar: createdByAvatar,
    scenarios: scenarios ?? [],
    context_sources: sources ?? [],
  });
});
