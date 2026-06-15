-- QAAP Initial Schema
-- Tenants + User Profiles + RLS

-- =============================================================================
-- Extensions
-- =============================================================================
create extension if not exists "pgcrypto";

-- =============================================================================
-- Utility: auto-update updated_at
-- =============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- Tenants
-- =============================================================================
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  branding    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_tenants_updated_at
  before update on tenants
  for each row execute function set_updated_at();

-- =============================================================================
-- User Profiles (extends auth.users)
-- =============================================================================
create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references tenants(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  role        text not null default 'viewer' check (role in ('superadmin', 'admin', 'editor', 'viewer')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_user_profiles_tenant on user_profiles(tenant_id);

create trigger trg_user_profiles_updated_at
  before update on user_profiles
  for each row execute function set_updated_at();

-- =============================================================================
-- RLS Policies
-- =============================================================================
alter table tenants enable row level security;
alter table user_profiles enable row level security;

-- Tenants: users can read their own tenant
create policy "Users can read own tenant"
  on tenants for select
  using (
    id in (select tenant_id from user_profiles where id = auth.uid())
  );

-- User profiles: users can read profiles in their tenant
create policy "Users can read tenant profiles"
  on user_profiles for select
  using (
    tenant_id in (select tenant_id from user_profiles where id = auth.uid())
  );

-- User profiles: users can update their own profile
create policy "Users can update own profile"
  on user_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
