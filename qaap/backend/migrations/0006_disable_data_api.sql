-- Disable direct Data API access (PostgREST)
-- All data access goes through Edge Functions using service_role or user token

revoke usage on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all routines in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on routines from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
