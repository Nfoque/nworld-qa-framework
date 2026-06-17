# QAAP Backend

Supabase project powering QAAP: Deno Edge Functions + PostgreSQL with RLS.

## Structure

```
backend/
├── config.toml             # Supabase project config (auth, realtime, edge runtime)
├── functions/              # 22 Deno Edge Functions
│   ├── _shared/            # Shared modules (auth, CORS, response helpers, DTOs)
│   ├── get-profile/        # Auth & profile
│   ├── update-avatar/
│   ├── get-tenants/
│   ├── get-connectors/     # Connector CRUD + test
│   ├── create-connector/
│   ├── update-connector/
│   ├── delete-connector/
│   ├── test-connector/
│   ├── get-llm-providers/  # LLM provider CRUD + test + model matrix
│   ├── create-llm-provider/
│   ├── update-llm-provider/
│   ├── delete-llm-provider/
│   ├── test-llm-provider/
│   ├── update-model-matrix/
│   ├── create-engine-job/  # Engine pipeline
│   ├── get-engine-job/
│   ├── list-engine-jobs/
│   ├── accept-proposal/
│   ├── list-test-plans/    # Test plan management
│   ├── get-test-plan/
│   └── update-scenario/
├── migrations/             # 19 PostgreSQL migrations
│   ├── 0001_initial_schema.sql        # Core tables + RLS
│   ├── ...
│   └── 0019_scenario_description.sql
└── deno.json / deno.lock   # Inside functions/
```

## Commands

From `qaap/` root:

```bash
npm run check:backend       # deno lint + deno fmt + deno check
npm run deno:test           # Run Deno tests
npm run deploy:functions    # Deploy all functions to Supabase
```

With Supabase CLI (from `qaap/backend/`):

```bash
supabase start              # Start local Supabase stack
supabase functions serve    # Serve Edge Functions locally
supabase db reset           # Reset local DB and replay migrations
```

## Key Design Decisions

- **PostgREST disabled** (migration 0006) — all data access through Edge Functions using service-role client
- **Multi-tenant via `tenant_id`** — RLS policies on every table, superadmin can override via `x-tenant-id` header
- **CORS hardened** — explicit origin allowlist in `_shared/cors.ts` (no wildcards)
- **Auto-profile on signup** — database trigger creates `user_profiles` row on `auth.users` insert; `@nfq.es` emails get superadmin role automatically
- **Engine job queue** — pgmq extension for at-least-once job delivery to the engine worker

See [QAAP CLAUDE.md](../CLAUDE.md) for full development details.
