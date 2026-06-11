# QAAP Documentation

## Structure

```
documentation/
├── product/     ← Product specs (architecture, domain model, phases, connectors, LLM pipeline, design, branding)
├── adr/         ← SPA architecture decisions — VSA + Domain Layer (17 ADRs)
└── skills/      ← Claude Code scaffolding skills for VSA structures (7 skills)
```

## Product Specs (`product/`)

Define what QAAP is and how it works at the product level.

| Document | Description |
|----------|-------------|
| [architecture-plan.md](product/architecture-plan.md) | Modular monolith architecture, tech stack, data flow, directory structure |
| [domain-model.md](product/domain-model.md) | All entities with field definitions, relationships, and rationale |
| [mvp-phases.md](product/mvp-phases.md) | 4-phase roadmap with scope and success criteria per phase |
| [connector-spec.md](product/connector-spec.md) | Connector interface, provider catalog, credential security |
| [llm-pipeline-spec.md](product/llm-pipeline-spec.md) | LLM orchestration, multi-provider routing, prompt templates |
| [design-handoff.md](product/design-handoff.md) | UI/UX design brief with screen inventory and component patterns |
| [nfq-branding.md](product/nfq-branding.md) | NFQ brand guidelines, color palette, typography, logo usage |

## SPA Architecture ADRs (`adr/`)

Define how the QAAP SPA is structured using VSA + Domain Layer. See [adr/README.md](adr/README.md) for the full navigation guide.

**Core** (stack-agnostic): 01-08 — principles, directory structure, features, domains, rules, naming.

**QAAP Stack** (implementation): 09-14 — React 19/Vite/MUI/TanStack/tRPC/Supabase mapping, mocking, E2E, dev environment.

**Design System**: 17 — MUI v9 patterns and conventions.

**Adoption**: 15-16 — when not to use, migration guide.

## Skills (`skills/`)

Claude Code slash commands for scaffolding VSA structures. See [skills/README.md](skills/README.md) for the catalog. Install by copying `.md` files to `.claude/commands/` in the target project.
