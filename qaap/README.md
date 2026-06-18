<p align="center">
  <picture>
    <img src=".github/qaap-logo.png" alt="QAAP" height="120" />
  </picture>
</p>

# QAAP — QA Automation Platform

> Multi-tenant SaaS platform for AI-powered E2E test automation

QAAP enables QA experts to automate the creation and maintenance of end-to-end
test plans using LLMs. Instead of replacing QA teams, it amplifies their
expertise — combining human judgment with AI-powered test generation, review,
and execution.

## What QAAP Does

1. **Ingest context** from multiple sources: Jira tickets, code repositories,
   OpenAPI specs, documents, free text
2. **Generate Gherkin test scenarios** using LLMs, with confidence scores and
   rationale
3. **Get second opinions** — generate with one model, review with another
   (Claude + Gemini, etc.)
4. **Review and refine** via human-in-the-loop chat (NotebookLM-style)
5. **Auto-codify** Gherkin into executable tests (Playwright, Cypress, Karate)
   with DOM-grounded selectors
6. **Validate and self-heal** — observation-based debug loop (screenshot + DOM
   state → evidence-based fix)
7. **Execute and monitor** — run tests, track health trends, detect degradation
8. **Write back** — update Jira tickets with comments, status transitions, PR
   links (audit trail)
9. **Propose fixes** — AI detects problems and suggests code changes as PRs

## Key Features

- **Multi-tenant SaaS** with per-tenant branding, SSO (OIDC/SAML), and data
  isolation
- **3 modalities**: Web (Playwright/Cypress), API (Karate), iOS (future)
- **Extensible connectors**: Jira, GitHub, GitLab, S3, Google Drive, Linear, and
  more
- **Multi-LLM orchestration**: Configure different models per task, no provider
  lock-in
- **Cucumber/Gherkin standard**: Framework-agnostic test representation
- **Health dashboard**: Pass rate trends, flaky test tracking, degradation
  alerts

## Project Structure

```
qaap/
├── spa/                    # React 19 SPA (Vite + MUI v9)
│   └── src/
│       ├── domains/        # dashboard, engine, knowledge-base, settings, test-plans
│       └── shared/         # auth, components, config, hooks, i18n, layout, tenant, theme, utils
│
├── backend/                # Supabase (Edge Functions + PostgreSQL)
│   ├── migrations/         # 19 SQL migrations
│   └── functions/          # 22 Deno Edge Functions + shared utils (_shared/)
│
├── engine/                 # LLM pipeline worker (Node.js/Docker) — design + PoC
│   ├── prompts/            # 5 step prompt templates
│   └── poc/                # Proof-of-concept runs (clau-lessons, waveconomy)
│
├── documentation/          # Product specs, ADRs, scaffolding skills
│   ├── product/            # 8 product spec documents
│   ├── adr/                # 17 architecture decision records
│   └── skills/             # 7 Claude Code scaffolding skills
│
├── prototypes/             # HTML/JSX prototypes (Netlify demos)
└── package.json            # Root scripts (dev, lint, check, deploy)
```

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 19, Vite 8, TypeScript 6, MUI v9, TanStack Query v5, TanStack Router |
| Backend    | Supabase Edge Functions (Deno)                                             |
| Database   | PostgreSQL with RLS (multi-tenant via tenant_id)                           |
| Auth       | Supabase Auth (Google OAuth)                                               |
| LLM        | OpenAI-compatible API (no SDK lock-in)                                     |
| Deployment | Vercel (SPA) + Supabase (backend)                                          |

## Getting Started

```bash
cd qaap
npm install --prefix spa    # Install SPA dependencies
npm run dev                 # Start dev server at http://localhost:5173
```

Backend (requires [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
cd qaap/backend
supabase start              # Start local Supabase stack
supabase functions serve    # Serve Edge Functions locally
```

## Documentation

See [documentation/](documentation/) for full product specs:

- [Architecture Plan](documentation/product/architecture-plan.md) — System
  design and tech decisions
- [Domain Model](documentation/product/domain-model.md) — All entities and
  relationships
- [MVP Phases](documentation/product/mvp-phases.md) — Roadmap from MVP to
  enterprise
- [Connector Spec](documentation/product/connector-spec.md) — Integration plugin
  architecture
- [LLM Pipeline Spec](documentation/product/llm-pipeline-spec.md) — AI
  orchestration layer
- [Design Handoff](documentation/product/design-handoff.md) — UI/UX design brief
- [NFQ Branding](documentation/product/nfq-branding.md) — Branding guidelines

For development details, see [CLAUDE.md](CLAUDE.md).

## Research Foundation

QAAP builds on consolidated QA automation research in the
[parent repository](../README.md):

- 13 analyzed articles on LLM-based testing (2022–2026)
- Client signals from real enterprise engagements
- Validated patterns: properties over content, confidence-based routing, living
  datasets, static-analysis-first, strict convention contracts, normalisation
  steps, observation-based debug

## Maintainers

| Name               | Email                 | Role  |
| ------------------ | --------------------- | ----- |
| **Iván Campillo**  | ivan.campillo@nfq.es  | Owner |
| **Alejandro Polo** | alejandro.polo@nfq.es | Owner |

---

Built by [NFQ](https://nfq.es)
