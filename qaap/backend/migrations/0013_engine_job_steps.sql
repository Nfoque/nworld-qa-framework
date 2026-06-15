-- Engine Job Steps — granular execution log for each pipeline stage.
-- Each step has typed input/output contracts (JSONB).
-- Output of step N feeds as input to step N+1.
-- No domain entities are created until the final proposal (step 5) is accepted.

create table engine_job_steps (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references engine_jobs(id) on delete cascade,
  position        smallint not null,
  step_type       text not null check (step_type in (
    'collect',
    'extract_features',
    'extract_plans',
    'extract_scenarios',
    'generate_proposal'
  )),
  status          text not null default 'pending' check (status in (
    'pending', 'running', 'completed', 'failed'
  )),
  input           jsonb not null default '{}',
  output          jsonb,
  meta            jsonb not null default '{}',
  error_message   text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index idx_engine_job_steps_position on engine_job_steps(job_id, position);
create index idx_engine_job_steps_status on engine_job_steps(job_id, status);

create trigger trg_engine_job_steps_updated_at
  before update on engine_job_steps
  for each row execute function set_updated_at();

-- RLS: inherit access from parent engine_job
alter table engine_job_steps enable row level security;

create policy "Users can read steps of their tenant jobs"
  on engine_job_steps for select
  using (job_id in (
    select ej.id from engine_jobs ej
    join user_profiles up on up.tenant_id = ej.tenant_id
    where up.id = auth.uid()
  ));

create policy "Editors can read steps of their tenant jobs"
  on engine_job_steps for update
  using (job_id in (
    select ej.id from engine_jobs ej
    join user_profiles up on up.tenant_id = ej.tenant_id
    where up.id = auth.uid() and up.role in ('superadmin', 'admin', 'editor')
  ));

-- Simplify engine_jobs.status — detailed state now tracked by steps
alter table engine_jobs drop constraint engine_jobs_status_check;
alter table engine_jobs add constraint engine_jobs_status_check
  check (status in ('queued', 'running', 'paused', 'completed', 'failed', 'cancelled'));
