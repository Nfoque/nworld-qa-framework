# QAAP — QA Automation Platform

## Overview

QAAP is a multi-tenant SaaS platform that enables QA experts to automate E2E test plan creation and maintenance using LLMs. It ingests diverse context sources (Jira, GitHub, OpenAPI, documents), generates Cucumber/Gherkin test scenarios with confidence scores, supports multi-LLM "second opinions", provides human-in-the-loop review via chat, and auto-codifies tests into Playwright/Cypress/Karate.

## Project Structure

```
qaap/
├── spa/                    # React SPA (Vite + MUI) — deployed to Vercel
│   └── src/
│       ├── domains/        # Feature modules (connectors, dashboard)
│       ├── shared/         # Auth, layout, theme, components, config, tenant
│       ├── main.tsx        # Entry point (providers + render)
│       └── router.tsx      # TanStack Router routes
│
├── backend/                # Supabase project (Edge Functions + PostgreSQL)
│   ├── config.toml         # Supabase local dev config (project_id: qaap)
│   ├── migrations/         # SQL migrations (0001–0009)
│   └── functions/          # Deno Edge Functions
│       ├── _shared/        # Shared utilities (client, response, cors, tenant, connectors)
│       ├── get-profile/    # User profile
│       ├── get-tenants/    # Tenant list (superadmin)
│       ├── get-connectors/ # List connectors for tenant
│       ├── create-connector/
│       ├── update-connector/
│       ├── delete-connector/
│       └── test-connector/ # Validate connector credentials
│
├── engine/                 # qaap-engine — autonomous pipeline worker (Node/Docker, to be built)
│   ├── PIPELINE-EXECUTION-REFERENCE.md  # ← BUILD SPEC: end-to-end job processing (contracts, schemas, lessons)
│   ├── README.md           # Engine architecture + state machine
│   ├── ROADMAP.md          # Milestones toward the real engine
│   ├── prompts/            # Verbatim LLM prompts (step 1–4)
│   └── poc/runs/           # Artifacts from manual pipeline simulations (clau-lessons, …)
│
├── documentation/          # Product specs, ADRs, scaffolding skills
│   ├── product/            # Architecture, domain model, MVP phases, connectors, LLM pipeline, design, branding
│   ├── adr/                # 17 ADRs (VSA, domain layer, stack adaptation, testing, dev env)
│   └── skills/             # 7 Claude Code skills for scaffolding VSA structures
│
├── prototypes/             # HTML/JSX prototypes (Netlify demos)
├── package.json            # Root scripts (dev, lint, check, deploy)
└── CLAUDE.md               # This file
```

## The Engine (pipeline)

The autonomous 5-step pipeline (`collect → extract_features → extract_plans → extract_scenarios → generate_proposal`) is specced in [`engine/PIPELINE-EXECUTION-REFERENCE.md`](engine/PIPELINE-EXECUTION-REFERENCE.md) — the canonical reference for how one `engine_job` is processed end-to-end (data model `engine_jobs`/`engine_job_steps`, `tick()`/`buildInput()`, per-step input/output contracts, prompts, the pipeline→domain mapping, and lessons from the clau-lessons simulation). Read it before touching engine or proposal code.

Project tasks live in **dwork** under the `qaap` project (`source_path: qaap/`).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TypeScript 6, MUI v9, TanStack Query v5, TanStack Router |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL with RLS (multi-tenant via tenant_id) |
| Auth | Supabase Auth (Google OAuth) |
| LLM | OpenAI-compatible API (no SDK lock-in) |
| Deployment | Vercel (SPA) + Supabase (backend) |

## Common Commands

### Root (from `qaap/`)

```bash
npm run dev                        # Start SPA dev server
npm run lint                       # Lint SPA (ESLint) + backend (Deno lint)
npm run format                     # Format SPA (Prettier) + backend (Deno fmt)
npm run check                      # Full check: lint + format + types + build (SPA + backend)
npm run build                      # Production build (SPA)
npm run deploy:functions           # Deploy all Edge Functions to Supabase
```

### SPA (from `qaap/spa/`)

```bash
npm install                        # Install dependencies
npm run dev                        # Dev server at http://localhost:5173
npm run build                      # tsc + vite build
npm run lint                       # ESLint check
npm run lint:fix                   # ESLint auto-fix
npm run format                     # Prettier write
npm run types:check                # tsc --noEmit
npm run check                      # lint:fix + format + types + build
```

### Backend (from `qaap/backend/`)

```bash
supabase start                     # Start local Supabase stack
supabase functions serve           # Serve Edge Functions locally
supabase db push                   # Push migrations to remote
supabase functions deploy <name>   # Deploy a single Edge Function
```

Migrations can also be applied via the Supabase MCP tool (`apply_migration`).

## Database

Supabase project: `zxdbfubcisgcfentbstg`

### Current tables (public schema)

| Table | Description |
|-------|------------|
| tenants | Multi-tenant isolation unit (slug, branding) |
| user_profiles | Extends auth.users (tenant_id, role, avatar) |
| connector_configs | Connector instances per tenant (type, credentials, config) |

All tables have RLS enabled with tenant isolation.

### Edge Functions

| Function | Purpose |
|----------|---------|
| get-profile | Return authenticated user's profile |
| get-tenants | List all tenants (superadmin only) |
| get-connectors | List connectors for the active tenant |
| create-connector | Create a new connector instance |
| update-connector | Update connector config/credentials |
| delete-connector | Remove a connector instance |
| test-connector | Validate connector credentials (e.g. GitHub token) |

### Shared utilities (`functions/_shared/`)

- `client.ts` — `createSupabaseClient(req)` and `createServiceClient()`
- `response.ts` — `preflight()`, `ok(data)`, `error(message, status)`
- `cors.ts` — CORS headers
- `tenant.ts` — Tenant resolution from request headers
- `connectors/github.ts` — GitHub API integration

## Environment Variables

### SPA (`spa/.env.local`)
```
VITE_SUPABASE_URL=https://zxdbfubcisgcfentbstg.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Architecture Patterns

- **Zero direct DB queries from frontend** — all data flows through Edge Functions
- **Edge Function pattern**: OPTIONS → CORS, Auth → verify, Business logic → `ok(data)` / `error(msg)`
- **Shared utilities**: Every function imports from `_shared/` (client, response, cors, tenant)
- **RLS for tenant isolation**: `tenant_id` on every table, policies filter by `auth.uid()`
- **Migrations**: SQL files in `backend/migrations/`, applied via MCP or CLI
- **VSA (Vertical Slice Architecture)**: SPA organized by `domains/<domain>/features/<feature>/`

## Design Principles (from research)

- **Properties over content** in assertions (assert visibility, count, enabled — not specific text)
- **Static analysis first, LLM where there is ambiguity**
- **Confidence + rationale** as mandatory LLM output format
- **Living dataset**: Every production failure becomes a golden test case
- **Build-time vs run-time separation**: LLM for exploration, deterministic for regression
- **Strict convention contracts**: Prohibitive rules > descriptive guidelines
- **Every LLM call logged** to prompt_logs table (non-negotiable NFR)

## Library Documentation (context7)

When writing code that uses project libraries, consult the **context7** MCP server (`resolve-library-id` → `query-docs`) to verify the current API instead of relying on training data. Prioritize for version-sensitive libraries:

- MUI v9 (`/mui/material-ui/v7.2.0` — closest available)
- TanStack Router, TanStack Query v5
- Supabase JS SDK
- React 19, Vite 8
- Playwright

Skip for trivial/stable APIs (basic HTML, standard JS built-ins).

## Related Documentation

- [Product specs](documentation/product/) — Architecture, domain model, MVP phases, connectors, LLM pipeline, design, branding
- [ADRs](documentation/adr/) — 17 ADRs on VSA, domain layer, stack adaptation, testing, dev environment
- [Scaffolding skills](documentation/skills/) — 7 Claude Code skills for creating domains, features, components, etc.
- [Root CLAUDE.md](../CLAUDE.md) — Research workflows, design principles, available skills
