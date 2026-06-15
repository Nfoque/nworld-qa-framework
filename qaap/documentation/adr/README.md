# VSA + Domain Layer — Architecture Decisions

Reference documentation for Vertical Slice Architecture + Functional Domain Layer, adapted for the QAAP SPA.

> Source: K.A.I — VSA + Capa de Dominio v3.0. QAAP-specific patterns derived from the product architecture.

## Core Architecture (from whitepaper)

| # | Document | One-line summary |
|---|---|---|
| 01 | [Architecture Principles](./01-architecture-principles.md) | Central thesis, 7 guiding principles, the paradigm shift |
| 02 | [Directory Structure](./02-directory-structure.md) | Generic pattern + QAAP adaptation with real paths |
| 03 | [Feature Anatomy](./03-feature-anatomy.md) | Files inside a feature, naming, responsibilities |
| 04 | [Domain Layer](./04-domain-layer.md) | What domains are, how to delimit, README template |
| 05 | [Structural Rules](./05-structural-rules.md) | 5 hard rules + how to verify each one |
| 06 | [Decision Rules](./06-decision-rules.md) | Scope hierarchy, rule of 3, promotion/demotion |
| 07 | [Complex Cases](./07-complex-cases.md) | Shared data, cross-feature communication, reusable logic |
| 08 | [Naming Conventions](./08-naming-conventions.md) | Kebab-case, business vocabulary, immutability |

## QAAP Stack Integration

| # | Document | One-line summary |
|---|---|---|
| 09 | [QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) | Mapping VSA to React 19/Vite/MUI/TanStack/Zustand/tRPC |
| 10 | [tRPC-Driven Development](./10-trpc-driven-development.md) | tRPC router → typed hooks, adapters, domain models |
| 11 | [Module Boundaries](./11-module-boundaries.md) | Package structure, workspace modules, import boundaries |
| 12 | [Mock Server](./12-mock-server.md) | MSW-based mocking for local development and E2E testing |
| 13 | [E2E Testing](./13-e2e-testing.md) | Playwright, feature-mapped specs, multi-environment |
| 14 | [Developer Environment](./14-developer-environment.md) | Scripts, environments, local Supabase, dev workflow |

## Design System

| # | Document | One-line summary |
|---|---|---|
| 17 | [MUI Design System](./17-mui-design-system.md) | MUI v6 component patterns, theming, testing for QAAP |

## Adoption

| # | Document | One-line summary |
|---|---|---|
| 15 | [When NOT to Use](./15-when-not-to-use.md) | 4 cases where VSA + Domain is not the right choice |
| 16 | [Migration Guide](./16-migration-guide.md) | Step-by-step for transforming a traditional SPA |

## Quick Reference

| If you need to... | Read |
|---|---|
| Understand the architecture | 01 → 02 → 04 |
| Create a new feature | 03 + 08 |
| Decide where code belongs | 06 + 07 |
| Set up or modify the dev environment | 14 + 12 |
| Connect to the API / use tRPC | 10 + 09 |
| Write E2E tests | 13 |
| Use MUI components | 17 |
| Migrate an existing SPA | 16 (check 15 first) |
| Understand when NOT to use VSA | 15 |

## Document Conventions

- All docs use English
- Docs 01-08 are stack-agnostic; 09-14 are QAAP-specific
- Each doc is self-contained — cross-references at the bottom point to related topics
- Code examples use the QAAP stack (React 19, TypeScript, Vite, MUI v6, TanStack Query/Router, Zustand, tRPC, Supabase)
