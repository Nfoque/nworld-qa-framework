-- Superadmins don't belong to a specific tenant

alter table user_profiles
  alter column tenant_id drop not null;
