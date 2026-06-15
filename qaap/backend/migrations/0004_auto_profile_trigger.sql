-- Auto-create user_profile on auth.users signup
-- New users get assigned to a default tenant with 'viewer' role

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, tenant_id, email, name, avatar_url, role)
  values (
    new.id,
    (select id from public.tenants where slug = 'default' limit 1),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'viewer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
