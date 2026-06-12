-- Initialize branding for all tenants (colors from prototype demos)
UPDATE tenants SET branding = jsonb_build_object(
  'primaryColor', v.primary_color,
  'primaryColorLight', v.primary_color_light,
  'primaryColorDark', v.primary_color_dark
)
FROM (VALUES
  ('nfq',              '#217BEE', '#EBF3FE', '#1860BE'),
  ('iberia',           '#D81E05', '#FDF0EE', '#B31804'),
  ('booking',          '#0071C2', '#E6F0F9', '#00487A'),
  ('ferrovial',        '#1A1A1A', '#F0EFEB', '#000000'),
  ('sacyr',            '#00879E', '#E6F5F7', '#006B7D'),
  ('oysho',            '#1A1A1A', '#F0F0F0', '#000000'),
  ('techmart',         '#6366F1', '#EEF2FF', '#4F46E5'),
  ('veci',             '#006B3F', '#E6F2EC', '#004D2D'),
  ('tecnicas-reunidas', '#6B8FA3', '#EDF2F5', '#4A6E82'),
  ('ivncmp',           '#6366F1', '#EEF2FF', '#4F46E5')
) AS v(slug, primary_color, primary_color_light, primary_color_dark)
WHERE tenants.slug = v.slug;
