-- Seed default tenant for development
insert into tenants (slug, name, branding)
values (
  'default',
  'QAAP Development',
  '{"primaryColor": "#6366f1", "accentColor": "#10b981"}'
) on conflict (slug) do nothing;
