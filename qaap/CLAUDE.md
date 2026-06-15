# QAAP — QA Automation Platform

## Overview

QAAP is a multi-tenant SaaS platform that enables QA experts to automate E2E test plan creation and maintenance using LLMs. It ingests diverse context sources (Jira, GitHub, OpenAPI, documents), generates Cucumber/Gherkin test scenarios with confidence scores, supports multi-LLM "second opinions", provides human-in-the-loop review via chat, and auto-codifies tests into Playwright/Cypress/Karate.

## Project Structure

```
qaap/
├── documentation/          # Product specs, design handoff, domain model, ADRs
│   ├── architecture-plan.md
│   ├── design-handoff.md
│   ├── domain-model.md
│   ├── mvp-phases.md
│   ├── connector-spec.md
│   ├── llm-pipeline-spec.md
│   └── decisions/          # ADRs
│
└── code/                   # Application monorepo (Turborepo + pnpm)
    ├── packages/
    │   ├── db/             # Drizzle ORM schema + migrations (PostgreSQL)
    │   └── shared/         # Shared types, validators (Zod), constants
    ├── apps/
    │   ├── api/            # Fastify + tRPC + Better Auth + BullMQ workers
    │   └── web/            # React 19 + Vite + MUI + TanStack Router/Query
    └── tooling/            # ESLint, TypeScript, Prettier configs
```

## Tech Stack

- **Frontend**: React 19, Vite, MUI v6, TanStack Router, TanStack Query v5, Zustand, Monaco Editor, Tiptap
- **Backend**: Fastify, tRPC v11 (internal API), REST (webhooks), Better Auth (SSO), BullMQ (job queue)
- **Database**: PostgreSQL 16 with RLS (multi-tenant), pgvector (RAG), Drizzle ORM
- **Cache/Queue**: Redis (Valkey) + BullMQ
- **LLM**: Custom client over OpenAI-compatible API (no SDK lock-in). LiteLLM as multi-provider gateway
- **Containers**: Docker Compose (dev), Helm (k8s production/on-prem)
- **Monorepo**: Turborepo + pnpm workspaces

## Common Commands

All commands run from `qaap/code/`:

```bash
pnpm install                       # Install all dependencies
pnpm dev                           # Start all apps (api + web) in dev mode
pnpm build                         # Build all packages and apps
pnpm lint                          # Lint all packages
pnpm typecheck                     # TypeScript type checking
pnpm test                          # Run all tests
docker compose up -d               # Start PostgreSQL + Redis
docker compose down                # Stop services
```

### Package-specific:
```bash
pnpm --filter @qaap/api dev        # Start API only
pnpm --filter @qaap/web dev        # Start frontend only
pnpm --filter @qaap/db migrate     # Run database migrations
pnpm --filter @qaap/db seed        # Seed development data
```

## Architecture

Modular monolith with explicit module boundaries. Modules communicate async via BullMQ. Multi-tenancy via PostgreSQL Row-Level Security (tenant_id on every table, RLS policies enforce isolation).

### Key Modules (in `apps/api/src/modules/`)

| Module | Responsibility |
|--------|---------------|
| auth | Better Auth setup, per-tenant SSO (OIDC/SAML) |
| tenant | CRUD tenants, branding, feature tiers |
| plan | Test plans, scenarios, Gherkin management |
| pipeline | Parsers, context assembler, LLM generator/reviewer/codifier |
| connector | Plugin registry + providers (Jira, GitHub, S3, etc.) |
| execution | Test runners, cron scheduler, failure analyzer |
| proactive | AI fix proposals, coverage gap detection |
| health | Trend analysis, degradation detection, alerts |
| report | Report generation + multi-channel delivery |
| chat | WebSocket human-in-the-loop conversations |

## Coding Conventions

- **File naming**: kebab-case (`test-plan.ts`, `llm-router.ts`)
- **Tests**: `file-name.test.ts(x)`
- **Types**: Shared types in `packages/shared/src/types/`, Zod validators in `validators/`
- **Module API**: Each module exports via barrel `index.ts`. Cross-module imports only from public API.
- **LLM outputs**: Always `{ result, confidence, rationale, model, tokensUsed, latencyMs }`
- **No SDK lock-in**: LLM calls use OpenAI-compatible `/v1/chat/completions` API. No provider-specific SDKs.
- **Prompt logging**: Every LLM call logged to `prompt_logs` table (non-negotiable NFR)
- **VSA (Vertical Slice Architecture)**: SPA organized by `domains/<domain>/features/<feature>/`
- **One component per .tsx file**: Each React component lives in its own file. Don't bundle multiple components (row, badge, helpers) in a single file. Extract sub-components into sibling files within the feature folder.

## Design Principles (from research)

- **Properties over content** in assertions (assert visibility, count, enabled — not specific text)
- **Static analysis first, LLM where there is ambiguity**
- **Confidence + rationale** as mandatory output format
- **Living dataset**: Every production failure becomes a golden test case
- **Build-time vs run-time separation**: LLM for exploration, deterministic for regression
- **Strict convention contracts**: Prohibitive rules ("PROHIBITED", "ONLY") > descriptive guidelines ("prefer")
- **Normalisation step**: Dedicated cheap LLM call to structure freeform input before the main pipeline
- **Observation-based debug**: Screenshot + DOM state for fixing failures, not just error message inference

## Related Documentation

- `documentation/architecture-plan.md` — Full architecture with diagrams
- `documentation/domain-model.md` — All entities with field definitions and rationale
- `documentation/mvp-phases.md` — Phase roadmap (4 phases)
- `documentation/connector-spec.md` — Connector interface and provider catalog
- `documentation/llm-pipeline-spec.md` — LLM orchestration, routing, prompt strategy
- `documentation/design-handoff.md` — UI/UX design brief (portable to design tools)

## Research Foundation

QAAP's decisions trace back to consolidated research in the parent repo (`../research/`):
- `insights.md` — 13 articles distilled into architectural constraints
- `patterns.md` — Recurring patterns across sources (12 patterns from 13 articles)
- `client-signals.md` — Real client needs validating product direction
