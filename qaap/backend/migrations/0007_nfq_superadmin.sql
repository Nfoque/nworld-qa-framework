-- nfq.es users are always superadmin with no tenant

create or replace function handle_new_user()
returns trigger as $$
declare
  user_email text := coalesce(new.email, '');
  user_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(user_email, '@', 1)
  );
  email_domain text := split_part(user_email, '@', 2);
  user_role text;
  user_tenant_id uuid;
begin
  if email_domain = 'nfq.es' then
    user_role := 'superadmin';
    user_tenant_id := null;
  else
    user_role := 'viewer';
    user_tenant_id := (select id from public.tenants where slug = 'default' limit 1);
  end if;

  insert into public.user_profiles (id, tenant_id, email, name, role)
  values (new.id, user_tenant_id, user_email, user_name, user_role);

  return new;
end;
$$ language plpgsql security definer;
