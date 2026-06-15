-- Domain tables — the materialization targets for an accepted engine proposal.
-- When a user accepts the step-5 proposal, an Edge Function writes:
--   proposal.test_plans[]   -> test_plans
--     .scenarios[]          -> test_scenarios
--     .context_sources[]    -> context_sources
-- These are standard domain entities the user works with after the pipeline ends.
-- See PIPELINE-EXECUTION-REFERENCE.md §6 and documentation/product/domain-model.md.

-- ─────────────────────────────────────────────────────────────────────────────
-- test_plans — central entity. 1 accepted feature/plan = 1 row.
-- ─────────────────────────────────────────────────────────────────────────────
create table test_plans (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  name                text not null,
  description         text not null default '',
  modality            text not null default 'web'
                        check (modality in ('web', 'api', 'ios')),
  status              text not null default 'draft'
                        check (status in ('draft', 'generating', 'review', 'approved', 'archived')),
  target_framework    text not null default 'playwright'
                        check (target_framework in ('playwright', 'cypress', 'karate', 'xcuitest')),
  target_environments jsonb not null default '[]',
  -- Traceability back to the pipeline run that produced this plan. SET NULL so a
  -- plan survives if its source job is deleted.
  engine_job_id       uuid references engine_jobs(id) on delete set null,
  created_by          uuid not null references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_test_plans_tenant on test_plans(tenant_id);
create index idx_test_plans_engine_job on test_plans(engine_job_id);

create trigger trg_test_plans_updated_at
  before update on test_plans
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- test_scenarios — 1 accepted scenario = 1 row (Gherkin + confidence + rationale).
-- ─────────────────────────────────────────────────────────────────────────────
create table test_scenarios (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  test_plan_id    uuid not null references test_plans(id) on delete cascade,
  title           text not null,
  gherkin_text    text not null,
  confidence      double precision check (confidence >= 0 and confidence <= 1),
  rationale       text not null default '',
  source_model    text,
  review_model    text,
  review_feedback text,
  review_status   text not null default 'pending'
                    check (review_status in ('pending', 'approved', 'rejected', 'modified')),
  sort_order      integer not null default 0,
  version         integer not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_test_scenarios_tenant on test_scenarios(tenant_id);
create index idx_test_scenarios_plan on test_scenarios(test_plan_id);

create trigger trg_test_scenarios_updated_at
  before update on test_scenarios
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- context_sources — links a plan back to the connector data it was derived from.
-- ─────────────────────────────────────────────────────────────────────────────
create table context_sources (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  test_plan_id        uuid not null references test_plans(id) on delete cascade,
  source_type         text not null
                        check (source_type in ('jira_ticket', 'repo_path', 'openapi_spec', 'document', 'free_text')),
  config              jsonb not null default '{}',
  connector_config_id uuid references connector_configs(id) on delete set null,
  sync_status         text not null default 'pending'
                        check (sync_status in ('pending', 'syncing', 'synced', 'error')),
  extracted_data      jsonb not null default '{}',
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_context_sources_tenant on context_sources(tenant_id);
create index idx_context_sources_plan on context_sources(test_plan_id);

create trigger trg_context_sources_updated_at
  before update on context_sources
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — tenant isolation, mirroring connector_configs (0008). Materialization
-- runs as service_role (bypasses RLS); these policies guard any direct access.
-- ─────────────────────────────────────────────────────────────────────────────
alter table test_plans enable row level security;
alter table test_scenarios enable row level security;
alter table context_sources enable row level security;

-- test_plans
create policy "Users can read tenant test plans"
  on test_plans for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Editors can insert test plans"
  on test_plans for insert
  with check (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Editors can update test plans"
  on test_plans for update
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Admins can delete test plans"
  on test_plans for delete
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin')
  ));

-- test_scenarios
create policy "Users can read tenant test scenarios"
  on test_scenarios for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Editors can insert test scenarios"
  on test_scenarios for insert
  with check (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Editors can update test scenarios"
  on test_scenarios for update
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Editors can delete test scenarios"
  on test_scenarios for delete
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

-- context_sources
create policy "Users can read tenant context sources"
  on context_sources for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Editors can insert context sources"
  on context_sources for insert
  with check (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Editors can update context sources"
  on context_sources for update
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));

create policy "Editors can delete context sources"
  on context_sources for delete
  using (tenant_id in (
    select tenant_id from user_profiles
    where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
  ));
