# Module Boundaries

> QAAP-specific: how workspace packages, domain boundaries, and import rules are enforced in the monorepo.

## Overview

QAAP is a single SPA within a Turborepo monorepo. There are no microfrontends — the SPA is deployed as one unit. Module boundaries are enforced through:

1. **Workspace packages** — shared code lives in `packages/` (db, shared)
2. **Domain directories** — `src/domains/` with structural import rules
3. **ESLint import boundaries** — automated enforcement

## Monorepo Package Structure

```
qaap/code/
├── apps/
│   ├── api/               ← Fastify + tRPC backend
│   └── web/               ← React SPA (this is where VSA lives)
│       └── src/
│           ├── domains/   ← VSA domain folders
│           ├── shared/    ← Cross-domain shared code
│           └── routes/    ← TanStack Router file-based routes
│
├── packages/
│   ├── db/                ← Drizzle schema + migrations (shared between api and web types)
│   └── shared/            ← Types + validators shared between frontend and backend
│       └── src/
│           ├── types/     ← Domain types used by both FE and BE
│           ├── validators/← Zod schemas (form validation = API validation)
│           └── constants/ ← Enums, thresholds, categories
│
└── tooling/               ← ESLint, TypeScript, Prettier configs
```

### Package Dependency Rules

```
apps/web  →  packages/shared  (types, validators)
apps/api  →  packages/shared  (types, validators)
apps/api  →  packages/db      (schema, migrations)
apps/web  ✗  packages/db      (web never imports DB schema directly)
```

The `packages/shared` package is the only crossing point between frontend and backend. It contains:
- **Zod schemas** — same validation runs client-side and server-side
- **TypeScript types** — shared domain types (enums, interfaces)
- **Constants** — confidence thresholds, failure categories, modalities

## Domain Import Boundaries

Within the SPA (`apps/web/src/`), the VSA structural rules apply:

```
domains/plans/features/plan-list/     ✗  domains/connectors/features/*
domains/plans/shared/                 ✗  domains/connectors/shared/
domains/plans/features/plan-list/     →  domains/plans/shared/
domains/plans/features/plan-list/     →  shared/*
```

### ESLint Enforcement

Use `eslint-plugin-import` with custom boundary rules:

```javascript
// .eslintrc.js (simplified)
rules: {
  "import/no-restricted-paths": ["error", {
    zones: [
      // Features cannot import from other features
      {
        target: "./src/domains/*/features/*",
        from: "./src/domains/*/features/*",
        except: ["./"],
      },
      // Domains cannot import from other domains
      {
        target: "./src/domains/*",
        from: "./src/domains/*",
        except: ["./"],
      },
      // Web app cannot import from db package
      {
        target: "./src",
        from: "../../packages/db",
      },
    ],
  }],
}
```

## Route ↔ Domain Mapping

Routes are thin wrappers that import domain features. The route file itself contains no business logic:

```typescript
// routes/_authenticated/plans/$planId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PlanDetail } from "@/domains/plans/features/plan-detail/plan-detail";

export const Route = createFileRoute("/_authenticated/plans/$planId")({
  component: PlanDetail,
});
```

This keeps the domain layer independent of the routing framework.

## Shared Code Promotion

The rule of 3 applies to workspace packages too:

| Used by | Action |
|---|---|
| 1 feature | Keep in the feature folder |
| 2 features, same domain | Duplicate (or domain shared) |
| 3+ features, same domain | Promote to `domains/{X}/shared/` |
| 3+ features, cross-domain | Promote to `src/shared/` |
| Both frontend and backend | Promote to `packages/shared/` |

## Related Docs

- [05 — Structural Rules](./05-structural-rules.md) — the 5 hard rules
- [06 — Decision Rules](./06-decision-rules.md) — rule of 3, promotion/demotion
- [02 — Directory Structure](./02-directory-structure.md) — full directory layout
- [09 — QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) — stack overview
