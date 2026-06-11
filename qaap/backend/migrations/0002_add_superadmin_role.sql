-- Add superadmin role to user_profiles

alter table user_profiles
  drop constraint user_profiles_role_check;

alter table user_profiles
  add constraint user_profiles_role_check
  check (role in ('superadmin', 'admin', 'editor', 'viewer'));

-- Superadmins can read all tenants
create policy "Superadmins can read all tenants"
  on tenants for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Superadmins can manage tenants
create policy "Superadmins can manage tenants"
  on tenants for all
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Superadmins can read all profiles
create policy "Superadmins can read all profiles"
  on user_profiles for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );
