# QAAP — Architecture Plan

## Context

NFQ quiere productizar su capacidad de QA como SaaS multi-tenant: **QAAP** (QA Automation Platform). El objetivo es permitir a expertos de QA automatizar la creacion y mantenimiento de planes de pruebas E2E usando LLMs, eliminando la necesidad de departamentos QA tradicionales. El producto debe ser deployable on-premise o en servidores NFQ, con SSO por cliente, branding por tenant, y soporte multi-LLM.

El repositorio ya contiene investigacion consolidada (13+ articulos, client signals, patterns, 3 ADRs, un generation protocol v0.1, y parsers parciales en `research/` y `qa-framework/`) que informan las decisiones de arquitectura.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | React 19 + Vite + TypeScript | Stack mas fuerte del equipo |
| **UI** | MUI (Material UI) v6 | ThemeProvider para branding por tenant, componentes enterprise (DataGrid, DatePicker) |
| **State** | TanStack Query v5 + Zustand | Server state + client state separados |
| **Routing** | TanStack Router | Type-safe, file-based routes, nested layouts |
| **Editors** | Monaco Editor (code) + Tiptap (Gherkin) | Syntax highlighting y edicion rica |
| **API** | tRPC v11 (interno) + REST (webhooks) | Type-safety end-to-end sin codegen |
| **Backend** | Fastify + TypeScript | Plugin architecture = connector model natural |
| **ORM** | Drizzle ORM | SQL-first, sin binarios, control total sobre RLS queries |
| **Database** | PostgreSQL 16 + pgvector | RLS para multi-tenancy, pgvector para RAG failure analysis |
| **Cache/Queue** | Redis (Valkey) + BullMQ | Jobs async para LLM, ejecucion, sync, crons |
| **Auth** | Better Auth | Self-hostable, multi-org OIDC/SAML, TypeScript-native |
| **Real-time** | SSE (streaming LLM) + WebSocket (chat) | Redis pub/sub para scaling horizontal |
| **LLM** | Custom client sobre OpenAI-compatible API | No SDK lock-in; LiteLLM como gateway multi-provider |
| **Monorepo** | Turborepo + pnpm workspaces | Build caching, shared types |
| **Containers** | Docker + Docker Compose (dev/small) + Helm (k8s) | On-prem friendly |

---

## Modular Monolith Architecture

Un solo contenedor con modulos internos y boundaries explicitos (ESLint import restrictions). Comunicacion async entre modulos via BullMQ. Primer candidato a extraer: `pipeline` (si necesita scaling independiente).

```
                        ┌─────────────────────────────┐
                        │       QAAP Frontend          │
                        │  React 19 + MUI + tRPC       │
                        │  Monaco + Tiptap             │
                        └────────────┬────────────────┘
                                     │ tRPC + SSE + WS
                        ┌────────────▼────────────────┐
                        │      API (Fastify)           │
                        │  Better Auth + RLS middleware │
                        └──┬──────┬──────┬──────┬─────┘
                           │      │      │      │
               ┌───────────┤      │      │      ├──────────┐
     ┌─────────▼──────┐ ┌─▼──────▼──┐ ┌▼──────▼───┐ ┌────▼─────┐
     │  plan           │ │ pipeline   │ │ execution  │ │connector │
     │                 │ │            │ │            │ │          │
     │ CRUD plans      │ │ parsers    │ │ runners    │ │ jira     │
     │ scenarios       │ │ assembler  │ │ playwright │ │ github   │
     │ gherkin mgmt    │ │ generator  │ │ karate     │ │ s3       │
     │ versioning      │ │ reviewer   │ │ scheduler  │ │ gdrive   │
     │                 │ │ codifier   │ │ reporter   │ │ linear   │
     │                 │ │ proactive  │ │ health     │ │          │
     └────────┬────────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘
              └────────────────┴───────┬──────┴──────────────┘
                              ┌────────▼────────┐
                              │   Data Layer     │
                              │ PostgreSQL (RLS) │
                              │ Redis (BullMQ)   │
                              │ S3/Minio         │
                              └─────────────────┘
```

### Modules

| Module | Responsibility |
|--------|---------------|
| **auth** | Better Auth setup, per-tenant SSO (OIDC/SAML) |
| **tenant** | CRUD tenants, branding config, feature tiers |
| **plan** | CRUD test plans, test scenarios, Gherkin parse/validate, versioning |
| **pipeline** | Parsers (source-code, openapi, jira, document, conventions), context assembler, LLM generator, reviewer ("second opinions"), codifier (Gherkin → test code), LLM router, prompt logger |
| **connector** | Plugin registry, provider implementations (Jira, GitHub, GitLab, Bitbucket, S3, GDrive, Linear, Trello), sync jobs, credential vault |
| **execution** | Test runner orchestration, Playwright/Karate runners (containerized), cron scheduler, failure analyzer (RAG-based) |
| **proactive** | AI-driven fix proposals, coverage gap detection, source change impact analysis |
| **health** | Health dashboard data, trend analysis, degradation detection, alerts |
| **report** | HTML/PDF/JUnit XML/XRay generators, delivery (email, Slack, Teams, webhook, push) |
| **chat** | WebSocket server, conversation management, context-aware responses |
| **shared** | DB client, logger, errors, types, encryption, storage (S3/Minio) |
| **queue** | BullMQ worker definitions, job types |

### Module Communication Rules

- Modules import from each other's public API only (barrel `index.ts` per module)
- Cross-module async work goes through BullMQ events (not direct function calls)
- `pipeline` is the heaviest module and first candidate for service extraction

---

## Multi-Tenancy: Row-Level Security

- Columna `tenant_id UUID NOT NULL` en toda tabla
- Fastify `onRequest` hook: `SET LOCAL app.current_tenant = '<uuid>'`
- RLS policy: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`
- App code nunca filtra por tenant_id — RLS lo hace transparente
- Premium tier futuro: Postgres instance dedicada para clientes enterprise

---

## Branding por Tenant

Stored como JSON en tabla `tenants`:
```typescript
{ logoUrl, faviconUrl, primaryColor, accentColor, backgroundColor, fontFamily, loginMessage }
```

Frontend: MUI `ThemeProvider` con tema generado dinamicamente desde tenant config:
```typescript
const theme = createTheme({
  palette: {
    primary: { main: tenant.primaryColor },
    secondary: { main: tenant.accentColor },
  },
  typography: { fontFamily: tenant.fontFamily || 'Inter' },
});
```

Tenant resolution: `{tenant-slug}.qaap.dev` (subdominio) o custom domain. On-prem single-tenant: slug hardcoded en env.

---

## Data Flow: Test Plan Creation Pipeline

```
User: "Crear suite de regresion para checkout"
  │
  ▼
1. CONTEXT INGESTION ─── Connectors pull: Jira tickets, source code,
  │                      OpenAPI specs, docs, existing tests
  ▼
2. PARSE (deterministico) ─── Static analysis sin LLM:
  │  Source Parser → testIds, routes, interactions
  │  OpenAPI Parser → endpoints, schemas, errors
  │  Jira Parser → ACs, flows, tags
  │  Doc Parser → requirements (chunked)
  │  Convention Parser → existing patterns
  ▼
3. ASSEMBLE + GENERATE ─── LLM entra aqui:
  │  Context → Prompt → LLM genera Gherkin con {confidence, rationale}
  │  <60% confidence → flagged para human review
  ▼
4. SECOND OPINION (opcional) ─── Modelo B revisa output de Modelo A
  │  "Review these scenarios. What is missing? What is wrong?"
  │  Diff merged con provenance (que modelo dijo que)
  ▼
5. HUMAN REVIEW (chat) ─── NotebookLM-style
  │  User ve plan, chatea: "Add negative case for expired card"
  │  LLM refina escenarios especificos. User aprueba.
  ▼
6. AUTO-CODIFICATION ─── Gherkin → codigo ejecutable
  │  Selecciona framework target (Playwright/Cypress/Karate)
  │  LLM genera test code usando conventions del parser
  │  Validacion: imports, testIds, compilacion
  ▼
7. PUSH + INTEGRATE ─── PR a repo cliente, sync a XRay, store en QAAP
```

---

## Directory Structure

```
qaap/
├── documentation/                      # Product documentation
│   ├── architecture-plan.md            # This document
│   ├── design-handoff.md               # Design brief for Claude Design
│   ├── domain-model.md                 # Entity definitions + relationships
│   ├── mvp-phases.md                   # Phase roadmap with scope per phase
│   ├── connector-spec.md               # Connector interface + provider catalog
│   ├── llm-pipeline-spec.md            # LLM orchestration, prompts, routing
│   └── decisions/                      # ADRs specific to QAAP
│
├── code/                               # Application code (monorepo root)
│   ├── package.json                    # Workspace root (pnpm)
│   ├── turbo.json                      # Turborepo config
│   ├── docker-compose.yml              # Dev
│   ├── docker-compose.prod.yml         # Production
│   ├── Dockerfile                      # Multi-stage (api + worker + migrations)
│   ├── helm/                           # Kubernetes Helm chart
│   │
│   ├── packages/
│   │   ├── db/                         # Drizzle schema + migrations
│   │   │   └── src/schema/             # tenants, users, test-plans, scenarios...
│   │   │       migrations/
│   │   │       seed/
│   │   │
│   │   └── shared/                     # Types + validators compartidos FE/BE
│   │       └── src/
│   │           ├── types/              # Domain types
│   │           ├── validators/         # Zod schemas
│   │           └── constants/          # Modalities, confidence thresholds, failure categories
│   │
│   ├── apps/
│   │   ├── api/                        # Fastify API server
│   │   │   └── src/
│   │   │       ├── server.ts
│   │   │       ├── trpc/               # Router, context, middleware
│   │   │       ├── modules/
│   │   │       │   ├── auth/           # Better Auth setup + SSO
│   │   │       │   ├── tenant/         # CRUD tenants, branding
│   │   │       │   ├── plan/           # CRUD test plans, scenarios, gherkin
│   │   │       │   ├── pipeline/       # Parsers, assembler, generator, reviewer, codifier
│   │   │       │   │   ├── parsers/
│   │   │       │   │   ├── prompts/
│   │   │       │   │   ├── llm-router.ts
│   │   │       │   │   └── llm-client.ts
│   │   │       │   ├── connector/      # Registry + providers
│   │   │       │   ├── execution/      # Runners, scheduler, failure analyzer
│   │   │       │   ├── proactive/      # AI fix proposals, coverage gaps
│   │   │       │   ├── report/         # Generators + delivery
│   │   │       │   ├── health/         # Trends, alerts, degradation
│   │   │       │   └── chat/           # WebSocket + conversations
│   │   │       ├── workers/            # BullMQ workers
│   │   │       └── webhooks/           # REST (Jira, GitHub, XRay callbacks)
│   │   │
│   │   └── web/                        # React frontend
│   │       └── src/
│   │           ├── routes/             # TanStack Router (file-based)
│   │           │   ├── _authenticated/
│   │           │   │   ├── dashboard.tsx
│   │           │   │   ├── plans/
│   │           │   │   ├── connectors/
│   │           │   │   ├── executions/
│   │           │   │   ├── health/
│   │           │   │   ├── reports/
│   │           │   │   ├── proposals/
│   │           │   │   └── settings/
│   │           │   └── _admin/
│   │           ├── features/
│   │           ├── stores/
│   │           └── hooks/
│   │
│   └── tooling/                        # ESLint, TypeScript, Prettier configs
```

---

## Key Decisions from Research

Estas decisiones vienen directamente de `research/insights.md` y `research/patterns.md`:

- **Properties over content** en assertions (5 fuentes independientes convergen)
- **Static analysis first, LLM where there is ambiguity** (Kshirsagar + Kastner)
- **Confidence + rationale** como output format obligatorio
- **OpenAI-compatible API** como capa de portabilidad (no SDK lock-in)
- **Prompt logging como NFR** desde dia 1 (Kastner postmortem)
- **Living dataset**: cada failure de produccion se convierte en golden test case
- **Failure analysis con RAG** + taxonomia 7 categorias (Singh) = highest enterprise leverage
- **Build-time vs run-time separation**: LLM para exploracion, deterministico para regresion
