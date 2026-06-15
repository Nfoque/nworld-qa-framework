-- Seed demo tenants from prototypes
INSERT INTO tenants (slug, name) VALUES
  ('iberia', 'Iberia'),
  ('booking', 'Booking.com'),
  ('ferrovial', 'Ferrovial'),
  ('nfq', 'Nfq'),
  ('sacyr', 'Sacyr'),
  ('oysho', 'Oysho'),
  ('techmart', 'TechMart'),
  ('veci', 'VECI'),
  ('tecnicas-reunidas', 'Técnicas Reunidas')
ON CONFLICT (slug) DO NOTHING;
