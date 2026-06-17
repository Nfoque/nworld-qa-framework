# QAAP — QA Automation Platform

## What This Is

Multi-tenant SaaS platform for AI-powered E2E test plan generation. QA experts configure connectors (GitHub, Jira, etc.), run an LLM-driven pipeline that extracts features and generates Gherkin scenarios with confidence scores, then review and accept proposals that materialize into test plans.

## Architecture

```
qaap/
├── spa/                    # React 19 SPA (Vite 8 + MUI v9)
│   └── src/
│       ├── domains/        # Vertical-slice feature modules
│       │   ├── dashboard/          features/home
│       │   ├── engine/             features/{engine-run, pipeline-list, proposal-review}
│       │   ├── knowledge-base/     features/{connector-list, knowledge-base}
│       │   ├── settings/           features/llm-providers
│       │   └── test-plans/         features/{test-plan-detail, test-plan-list}
│       ├── shared/         # Cross-cutting concerns
│       │   ├── auth/       # AuthenticatedGuard, LoginGuard, session hooks
│       │   ├── components/ # Reusable UI components
│       │   ├── config/     # Supabase client init
│       │   ├── hooks/      # Shared hooks
│       │   ├── i18n/       # i18next setup + translations
│       │   ├── layout/     # App shell, sidebar, header
│       │   ├── tenant/     # Tenant context and branding
│       │   ├── theme/      # MUI theme customization
│       │   └── utils/      # Helpers
│       ├── router.tsx      # TanStack Router route tree
│       ├── themed-app.tsx  # Root app with providers
│       └── main.tsx        # Entry point
│
├── backend/                # Supabase project
│   ├── functions/          # 22 Deno Edge Functions + _shared/
│   ├── migrations/         # 19 PostgreSQL migrations
│   └── config.toml         # Supabase config
│
├── engine/                 # Standalone Node.js worker (Docker)
│   ├── README.md           # Full pipeline spec with step contracts
│   ├── ROADMAP.md
│   ├── poc/                # Proof-of-concept code
│   └── prompts/            # LLM prompt templates per step
│
├── documentation/          # Product specs and architecture decisions
│   ├── product/            # 8 product spec docs
│   ├── adr/                # 17 architecture decision records
│   ├── skills/             # 7 Claude Code scaffolding skills
│   └── decisions/          # Legacy decisions folder
│
├── prototypes/             # HTML/JSX demos (Netlify-hosted, multi-tenant branding)
│
└── package.json            # Root scripts orchestrating spa + backend checks
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TypeScript 6, MUI v9, TanStack Router, TanStack Query v5, i18next, react-markdown |
| Backend | Supabase Edge Functions (Deno), `@supabase/supabase-js` |
| Database | PostgreSQL with RLS (multi-tenant via `tenant_id`), PostgREST disabled |
| Auth | Supabase Auth (Google OAuth) |
| Engine | Node.js worker (Docker), polls pgmq, OpenAI-compatible LLM API |
| LLM | OpenAI-compatible API via fetch (no provider SDK lock-in) |
| Deployment | Vercel (SPA) + Supabase (backend + database) |
| Testing | Vitest, Testing Library |
| Code quality | ESLint 10, Prettier, Husky + lint-staged, typescript-eslint (strict) |

## Development Commands

### From `qaap/` (root)

```bash
npm run dev               # Start SPA dev server (delegates to spa/)
npm run build             # Build SPA (delegates to spa/)
npm run check             # Full check: SPA + backend (run before push)
npm run check:spa         # eslint fix + prettier write + tsc --noEmit + vite build
npm run check:backend     # deno lint + deno fmt + deno check
npm run lint              # ESLint (spa) + deno lint (backend)
npm run format            # Prettier (spa) + deno fmt (backend)
npm run deno:test         # Run Deno tests for Edge Functions
npm run deploy:functions  # Deploy all Edge Functions to Supabase
```

### From `qaap/spa/`

```bash
npm run dev               # Vite dev server at http://localhost:5173
npm run build             # tsc -b && vite build
npm run check             # eslint fix + prettier + tsc --noEmit + vite build
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run format            # Prettier write
npm run format:check      # Prettier check
npm run test              # Vitest run (single pass)
npm run test:watch        # Vitest watch mode
npm run test:ui           # Vitest UI
npm run types:check       # tsc --noEmit
```

### Backend (Supabase CLI)

```bash
cd qaap/backend
supabase start            # Start local Supabase stack (Postgres, Auth, etc.)
supabase functions serve  # Serve Edge Functions locally
supabase db reset         # Reset local DB and replay migrations
```

## SPA Architecture

**Vertical-slice domains** with a shared layer. Each domain has `features/` containing self-contained feature folders.

### Routes

| Path | Component | Domain |
|------|-----------|--------|
| `/login` | LoginGuard | shared/auth |
| `/` | redirects to `/test-plans` | - |
| `/connectors` | ConnectorList | knowledge-base |
| `/knowledge-base` | KnowledgeBase | knowledge-base |
| `/pipelines` | PipelineList | engine |
| `/pipelines/$jobId` | EngineRun | engine |
| `/pipelines/$jobId/review` | ProposalReview | engine |
| `/test-plans` | TestPlanList | test-plans |
| `/test-plans/$planId` | TestPlanDetail | test-plans |
| `/settings` | LlmProviderList | settings |

### Imports

Path alias `@/` maps to `src/`. Import order enforced by `eslint-plugin-import-x`: builtin > external > internal > parent > sibling > index, alphabetized, with newlines between groups.

## Backend Architecture

### Edge Functions (22 functions)

All functions follow the same pattern: `Deno.serve()` handler with CORS preflight, auth check, tenant resolution, then business logic.

**Auth & profile:**
- `get-profile` — Get authenticated user's profile + tenant
- `update-avatar` — Update user avatar
- `get-tenants` — List tenants (superadmin only)

**Connectors:**
- `get-connectors`, `create-connector`, `update-connector`, `delete-connector`, `test-connector`

**LLM providers:**
- `get-llm-providers`, `create-llm-provider`, `update-llm-provider`, `delete-llm-provider`, `test-llm-provider`, `update-model-matrix`

**Engine (pipeline):**
- `create-engine-job` — Create job + 5 pending steps + enqueue via pgmq
- `get-engine-job`, `list-engine-jobs`
- `accept-proposal` — Materialize accepted proposal into domain tables

**Test plans:**
- `list-test-plans`, `get-test-plan`, `update-scenario`

### Shared Modules (`_shared/`)

| Module | Purpose |
|--------|---------|
| `auth.ts` | `authenticateAndResolveTenant()`, `requireRole()` |
| `client.ts` | `createSupabaseClient()` (per-request), `createServiceClient()` (service role) |
| `cors.ts` | CORS headers with explicit origin allowlist (hardened after pentest) |
| `response.ts` | `ok()`, `error()`, `preflight()`, `parseBody()` helpers |
| `tenant.ts` | `resolveTenantId()` — reads profile, superadmin can override via `x-tenant-id` header |
| `url-safety.ts` | URL validation for upstream requests |
| `engine-jobs.ts` | Engine job helpers |
| `connectors/` | Connector DTOs + provider implementations (GitHub, Supabase Storage) |
| `llm-providers/` | LLM provider DTOs |

## Database

PostgreSQL with Row-Level Security. **PostgREST is disabled** — all data access goes through Edge Functions using a service-role client.

### Multi-tenancy

- Every table has a `tenant_id` column
- RLS policies enforce tenant isolation
- Superadmins (role `superadmin`, `tenant_id` is nullable) can override tenant context via `x-tenant-id` request header
- User profiles auto-created via database trigger on auth signup

### Key Tables

- `tenants` — Tenant config (slug, name, branding JSONB)
- `user_profiles` — Users linked to tenants (id, email, name, role, tenant_id, avatar_url)
- `connector_configs` — Data source connections (type, credentials, tenant-scoped)
- `llm_provider_configs` — LLM provider settings (model matrix, API keys, tenant-scoped)
- `engine_jobs` — Pipeline execution jobs (status, selected_sources, created_by)
- `engine_job_steps` — 5 steps per job (position, step_type, status, input/output JSONB, meta)
- `test_plans` — Materialized test plans (from accepted proposals)
- `test_scenarios` — Individual Gherkin scenarios within plans (confidence, rationale, category)
- `prompt_logs` — Every LLM call logged (non-negotiable NFR)

### Migrations

19 migrations in `backend/migrations/` covering: initial schema, superadmin role, auto-profile trigger, default tenant seeding, connector configs, engine jobs/steps, LLM provider configs, domain tables, pgmq queue setup.

## Engine (Worker)

Standalone Node.js/Docker process that executes the 5-step pipeline autonomously. See `engine/README.md` for full contracts.

**Pipeline steps:**
1. `collect` — LLM agent explores data sources, gathers raw chunks
2. `extract_features` — LLM identifies high-level features from chunks
3. `extract_plans` — LLM identifies testable areas per feature (parallel)
4. `extract_scenarios` — LLM generates Gherkin scenarios per test area (parallel)
5. `generate_proposal` — Pure aggregation into nested tree (no LLM)

**Flow:** Job queued via pgmq -> engine polls -> runs steps 1-5 -> pauses at proposal -> user reviews in SPA -> accepts -> Edge Function materializes into domain tables.

## Key Patterns

- **One component per `.tsx` file** — extract sub-components into sibling files
- **Domain-driven vertical slices** — `domains/<domain>/features/<feature>/` structure
- **Confidence + rationale** on every LLM output — `{ result, confidence, rationale }`
- **OpenAI-compatible API** — no provider SDK lock-in, all LLM calls via standard `/v1/chat/completions`
- **Every LLM call logged** to `prompt_logs` table (non-negotiable NFR)
- **Properties over content** in test assertions — assert visibility, count, enabled, not literal text
- **Strict convention contracts** — prohibitive rules ("PROHIBITED", "ONLY") over descriptive ("prefer", "try to")
- **Service-role only** — Edge Functions use service-role Supabase client, never expose PostgREST
- **Consistent error responses** — all Edge Functions return `{ error: "CODE" }` with appropriate HTTP status

## Pre-commit Hooks

Husky + lint-staged on `spa/`:
- `src/**/*.{ts,tsx}` — ESLint fix + Prettier write
- `src/**/*.css` — Prettier write

## Documentation

### Product specs (`documentation/product/`)
- `architecture-plan.md` — System design and tech decisions
- `domain-model.md` — All entities with field definitions
- `mvp-phases.md` — Phase roadmap
- `connector-spec.md` — Connector plugin architecture
- `llm-pipeline-spec.md` — LLM orchestration, routing, prompt strategy
- `design-handoff.md` — UI/UX design brief
- `nfq-branding.md` — NFQ branding guidelines

### Architecture Decision Records (`documentation/adr/`)
17 ADRs covering: architecture principles, directory structure, feature anatomy, domain layer, structural rules, decision rules, complex cases, naming conventions, stack adaptation, development patterns, module boundaries, mock server, e2e testing, developer environment, when-not-to-use, migration guide, MUI design system.

### Scaffolding skills (`documentation/skills/`)
Claude Code skills for creating: components, domains, features, e2e specs, environments, mock fixtures. Plus a verify skill.

## README Maintenance

This file (`qaap/CLAUDE.md`), `qaap/README.md`, `qaap/spa/README.md`, `qaap/backend/README.md`, and the root `README.md` all contain concrete counts and lists (Edge Function count, migration count, domain list, ADR count, etc.). **When you add, remove, or rename any of these, update every file that references the changed data.** See the root `CLAUDE.md` "README Maintenance" section for the full trigger table.
