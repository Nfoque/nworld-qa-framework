-- LLM Provider Configs — tenant-level LLM provider configurations
create table llm_provider_configs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  provider_name   text not null check (provider_name in ('anthropic', 'openai', 'google', 'ollama', 'litellm', 'custom')),
  display_name    text not null,
  base_url        text not null,
  api_key         text,
  available_models jsonb not null default '[]',
  is_default      boolean not null default false,
  status          text not null default 'disabled' check (status in ('active', 'error', 'disabled')),
  status_message  text,
  last_tested_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_llm_provider_configs_tenant on llm_provider_configs(tenant_id);
create unique index idx_llm_provider_configs_tenant_provider on llm_provider_configs(tenant_id, provider_name);
create unique index idx_llm_provider_configs_default on llm_provider_configs(tenant_id) where is_default = true;

create trigger trg_llm_provider_configs_updated_at
  before update on llm_provider_configs
  for each row execute function set_updated_at();

-- RLS
alter table llm_provider_configs enable row level security;

create policy "Users can read tenant LLM providers"
  on llm_provider_configs for select
  using (tenant_id in (select tenant_id from user_profiles where id = auth.uid()));

create policy "Admins can insert LLM providers"
  on llm_provider_configs for insert
  with check (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );

create policy "Admins can update LLM providers"
  on llm_provider_configs for update
  using (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin', 'editor')
    )
  );

create policy "Admins can delete LLM providers"
  on llm_provider_configs for delete
  using (
    tenant_id in (
      select tenant_id from user_profiles
      where id = auth.uid() and role in ('superadmin', 'admin')
    )
  );

-- Tenant-level model matrix (cross-provider task-to-model mapping)
alter table tenants add column llm_model_matrix jsonb not null default '{}';
