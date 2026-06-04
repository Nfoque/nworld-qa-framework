# QAAP — QA Automation Platform

> Multi-tenant SaaS platform for AI-powered E2E test automation

QAAP enables QA experts to automate the creation and maintenance of end-to-end test plans using LLMs. Instead of replacing QA teams, it amplifies their expertise — combining human judgment with AI-powered test generation, review, and execution.

## What QAAP Does

1. **Ingest context** from multiple sources: Jira tickets, code repositories, OpenAPI specs, documents, free text
2. **Generate Gherkin test scenarios** using LLMs, with confidence scores and rationale
3. **Get second opinions** — generate with one model, review with another (Claude + Gemini, etc.)
4. **Review and refine** via human-in-the-loop chat (NotebookLM-style)
5. **Auto-codify** Gherkin into executable tests (Playwright, Cypress, Karate) with DOM-grounded selectors
6. **Validate and self-heal** — observation-based debug loop (screenshot + DOM state → evidence-based fix)
7. **Execute and monitor** — run tests, track health trends, detect degradation
8. **Write back** — update Jira tickets with comments, status transitions, PR links (audit trail)
9. **Propose fixes** — AI detects problems and suggests code changes as PRs

## Key Features

- **Multi-tenant SaaS** with per-tenant branding, SSO (OIDC/SAML), and data isolation
- **3 modalities**: Web (Playwright/Cypress), API (Karate), iOS (future)
- **Extensible connectors**: Jira, GitHub, GitLab, S3, Google Drive, Linear, and more
- **Multi-LLM orchestration**: Configure different models per task, no provider lock-in
- **Cucumber/Gherkin standard**: Framework-agnostic test representation
- **Health dashboard**: Pass rate trends, flaky test tracking, degradation alerts
- **Deployable anywhere**: Cloud SaaS or on-premise via Docker/Kubernetes

## Project Structure

```
qaap/
├── documentation/      # Product documentation
│   ├── architecture-plan.md
│   ├── design-handoff.md
│   ├── domain-model.md
│   ├── mvp-phases.md
│   ├── connector-spec.md
│   ├── llm-pipeline-spec.md
│   └── decisions/
│
└── code/               # Application monorepo
    ├── apps/
    │   ├── api/        # Fastify + tRPC backend
    │   └── web/        # React 19 + MUI frontend
    ├── packages/
    │   ├── db/         # PostgreSQL schema (Drizzle)
    │   └── shared/     # Shared types and validators
    └── tooling/        # Dev tooling configs
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, MUI v6, TanStack Router/Query, Zustand |
| Backend | Fastify, tRPC v11, Better Auth, BullMQ |
| Database | PostgreSQL 16 (RLS), pgvector, Drizzle ORM |
| Queue | Redis (Valkey) + BullMQ |
| LLM | OpenAI-compatible API, LiteLLM gateway |
| Monorepo | Turborepo + pnpm |
| Deploy | Docker Compose / Helm (Kubernetes) |

## Getting Started

```bash
cd qaap/code
pnpm install
docker compose up -d    # PostgreSQL + Redis
pnpm dev                # Start API + Web
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

## Documentation

See [documentation/](documentation/) for full product specs:
- [Architecture Plan](documentation/architecture-plan.md) — System design and tech decisions
- [Domain Model](documentation/domain-model.md) — All entities and relationships
- [MVP Phases](documentation/mvp-phases.md) — Roadmap from MVP to enterprise
- [Connector Spec](documentation/connector-spec.md) — Integration plugin architecture
- [LLM Pipeline Spec](documentation/llm-pipeline-spec.md) — AI orchestration layer
- [Design Handoff](documentation/design-handoff.md) — UI/UX design brief

## Research Foundation

QAAP builds on consolidated QA automation research in the parent repository:
- 13 analyzed articles on LLM-based testing (2022-2026)
- Client signals from real enterprise engagements
- Validated patterns: properties over content, confidence-based routing, living datasets, static-analysis-first, strict convention contracts, normalisation steps, observation-based debug

---

Built by [NFQ](https://nfq.es)
