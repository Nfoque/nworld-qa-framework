-- Engine Jobs — pipeline execution instances
create table engine_jobs (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  status           text not null default 'queued' check (status in (
    'queued', 'collecting', 'extracting_features', 'awaiting_feature_review',
    'extracting_plans', 'awaiting_plan_review',
    'extracting_scenarios', 'awaiting_scenario_review',
    'ready_for_codification', 'completed', 'failed', 'cancelled'
  )),
  selected_sources jsonb not null default '[]',
  created_by       uuid not null references auth.users(id),
  error_message    text,
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_engine_jobs_tenant on engine_jobs(tenant_id);
create index idx_engine_jobs_status on engine_jobs(tenant_id, status);

create trigger trg_engine_jobs_updated_at
  before update on engine_jobs
  for each row execute function set_updated_at();

-- RLS
alter table engine_jobs enable row level security;

create policy "Users can read tenant jobs"
  on engine_jobs for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Editors can create jobs"
  on engine_jobs for insert
  with check (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );

create policy "Editors can update jobs"
  on engine_jobs for update
  using (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );
