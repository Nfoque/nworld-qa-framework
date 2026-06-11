# Feature Anatomy

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 05

## What Is a Feature

A feature is the **atomic unit** of the architecture. It's a self-contained folder with everything needed to implement a single piece of business functionality: entry point, logic, types, and tests.

A well-designed feature can be deleted by removing a single folder, without affecting anything else.

## Files Inside a Feature

| File | Responsibility | Required |
|---|---|---|
| **Entry point** (`.tsx`) | Handler, controller, component, or exposed function | Always |
| **Service** (`.service.ts`) | API calls via TanStack Query, keyFactory, data orchestration | Only if the feature makes API calls or composes multiple data sources |
| **Types** (`.types.ts`) | Data models specific to this feature | Only if the feature defines its own domain models (typically paired with a service/adapter) |
| **Adapter** (`.adapter.ts`) | Pure function: API model → domain model | Only if the feature consumes external API data |
| **Store** (`.store.ts`) | Zustand store for feature-local client state | Only if the feature has client state beyond what the component manages |
| **Styles** (`.css`) | MUI sx overrides + custom styles | As needed |
| **Tests** (`.test.tsx`) | Unit and integration tests, colocated | Always |
| **README.md** | 5-8 lines: what it does and how to invoke it | Always |

Concrete file names vary by stack, but the conceptual structure is stable.

### When to omit service/types/adapter

Not every feature makes API calls. A feature that only reads from a shared domain store or renders static UI does not need a service, types, or adapter file. **Don't create files just to satisfy a template — create them when there's real logic to put in them.**

| Feature pattern | Files needed |
|---|---|
| Makes API calls, transforms response | entry + service + types + adapter + test + README |
| Reads from shared domain store only | entry + test + README |
| Pure UI with local state | entry + store + test + README |
| Pure UI, no state | entry + test + README |

## QAAP Feature Examples

### Feature with API integration

```
plan-list/
  plan-list.tsx               ← React component (entry point)
  plan-list.css               ← Styles (MUI sx overrides + custom)
  plan-list.service.ts        ← TanStack Query hooks via tRPC (uses adapter in select)
  plan-list.adapter.ts        ← API response → domain model
  plan-list.types.ts          ← Frontend domain models
  plan-list.test.tsx          ← Vitest + RTL tests
  plan-list-filters.tsx       ← Internal subcomponent (own file, NOT a separate feature)
  plan-list-table.tsx         ← Another subcomponent (own file)
  README.md
```

### Feature without API calls (reads from shared domain store)

```
dashboard-summary/
  dashboard-summary.tsx       ← React component (entry point)
  dashboard-summary.css       ← Styles
  dashboard-summary.test.tsx  ← Vitest + RTL tests
  README.md
```

## Naming Rules

- **kebab-case** for all files and folders: `list-products`, not `ListProducts` or `list_products`
- **Feature-prefixed**: all files in a feature share the same prefix (`list-products.tsx`, `list-products.service.ts`)
- **Business vocabulary**: names reflect domain concepts, not technical details (`list-products`, not `ProductTableWithPagination`)

An `ls` of the folder tells you exactly what's inside without opening anything.

## One Component Per File (hard rule)

Every React component — even small presentational ones — must be in its **own `.tsx` file**. Never define multiple components in the same file.

```
❌ product-milestones.tsx  (defines ColorItem, OrderItem, and ProductMilestones)
✅ product-milestones.tsx  (ProductMilestones only)
   color-item.tsx          (ColorItem)
   order-item.tsx          (OrderItem)
```

Subcomponents that belong to a feature live in the **same feature folder** as separate files. They are NOT separate features — just separate files.

## When Is Something a Feature vs. a Subcomponent?

Ask these three questions:

1. **Does it have its own API/service?** — If it makes independent API calls, it's likely a feature
2. **Could it live at its own route?** — If it makes sense as a standalone page, it's a feature
3. **Can it change independently?** — If a team could modify it without touching other sections, it's a feature

If all three are **no** → it's a `.tsx` file inside the parent feature folder (separate file, not a separate feature).
If any is **yes** → it probably deserves its own feature folder.

## Colocated Tests

Tests live **inside the feature folder**, not in a parallel `tests/` hierarchy.

Three concrete advantages:
- The agent knows which tests to run for a change without searching
- Deleting a feature deletes its tests automatically
- The test is part of the feature's "definition", not a separate artifact

## Related Docs

- [02 — Directory Structure](./02-directory-structure.md) — where features live in the tree
- [05 — Structural Rules](./05-structural-rules.md) — import constraints between features
- [08 — Naming Conventions](./08-naming-conventions.md) — detailed naming rules
- [17 — MUI Design System](./17-mui-design-system.md) — MUI v6 component patterns for features
