-- Connector Configs — tenant-level integration configurations
create table connector_configs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  connector_id    text not null,
  category        text not null check (category in ('task-manager', 'document-source', 'code-repo', 'test-runner', 'notification')),
  display_name    text not null,
  description     text not null default '',
  config          jsonb not null default '{}',
  credentials     jsonb,
  status          text not null default 'disabled' check (status in ('active', 'error', 'disabled')),
  status_message  text,
  last_synced_at  timestamptz,
  last_tested_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_connector_configs_tenant on connector_configs(tenant_id);
create unique index idx_connector_configs_tenant_connector on connector_configs(tenant_id, connector_id);

create trigger trg_connector_configs_updated_at
  before update on connector_configs
  for each row execute function set_updated_at();

-- RLS
alter table connector_configs enable row level security;

create policy "Users can read tenant connectors"
  on connector_configs for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Admins can insert connectors"
  on connector_configs for insert
  with check (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );

create policy "Admins can update connectors"
  on connector_configs for update
  using (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );

create policy "Admins can delete connectors"
  on connector_configs for delete
  using (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin')
    )
  );
