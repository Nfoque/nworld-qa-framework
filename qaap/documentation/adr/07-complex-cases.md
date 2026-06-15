# Complex Cases

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 08

## Overview

The feature-based structure works perfectly for 80% of cases. Three situations require explicit decisions to prevent degeneration.

## 1. Shared Data Between Components

Two features need access to the same data (current user, global config, product list).

### Long-lived global state

If the data is cross-cutting to the entire application (session, permissions, tenant config), **it's not a feature: it's infrastructure**. It lives in `src/shared/` with a single public access point and multiple consumers.

**QAAP example**: Supabase auth context, tenant config, i18n → `src/shared/auth/`, `src/shared/i18n/`

### Same resource, different uses

Two features appear to need the same data but use it differently:
- A profile screen needs 30 fields of a user
- An autocomplete for mentions needs only 3 fields

The API URL may coincide, but **it's not the same data**. Each feature defines its own call with the exact shape it needs.

**QAAP example**: each feature has its own `.service.ts` with its own TanStack Query hook (via tRPC), even if the endpoint is the same. Different `select` functions extract different shapes.

### Same data, same format

When two features need literally the same data in the same format, apply the **rule of 3**:

| Consumers | Action |
|---|---|
| 2 | **Duplicate** — keep each feature independent |
| 3+ | **Promote** — move to `shared/` at the correct scope |

## 2. Cross-Feature Communication (non parent/child)

A filter panel and a table in different screen zones must sync state, but they live in separate features.

### Within a feature

If the components belong to the same feature, the state lives in a context or local store inside the folder. Simple, contained, easy to delete.

### Sibling features in the same domain

Here `domains/{X}/shared/` shines. Two options:

- The state lives in a **container feature** that orchestrates the others
- Or in a **dedicated store** in the domain's `shared/`

Sibling features consume it, but the store's scope is contained to the domain.

**QAAP example**: Zustand store in `domains/{X}/shared/domain-store/`, consumed by features of that domain only.

### Features from different domains

Rare and normally symptomatic. If two domains need to share live state, it usually indicates **the domains aren't well delimited**.

Before promoting something to `src/shared/`, reconsider the domain design.

**QAAP pattern for true cross-domain**: lightweight event emitter in `src/shared/events/` or a global Zustand store in `src/shared/`. Features subscribe to state changes. No direct imports between domains.

## 3. Reusable Logic Between Features

Same principle as data: the rule of 3.

| Scope | Action |
|---|---|
| 3+ features of the same domain | Promote to `domains/{X}/shared/` |
| 3+ features of different domains | Promote to `src/shared/` |
| Below threshold | **Duplicate** |

### Utilities, formatters, helpers

A date formatter used by 5 features from 3 domains → `src/shared/utils/format-date.ts`

A price calculator used by 2 features of `billing/` → duplicate in each feature

### Custom hooks

A `useDebounce` hook used everywhere → `src/shared/hooks/use-debounce.ts`

A `useProductFilters` hook used by 2 features of `catalog/` → duplicate for now, promote if a third consumer appears

## Related Docs

- [06 — Decision Rules](./06-decision-rules.md) — the hierarchy and rule of 3
- [05 — Structural Rules](./05-structural-rules.md) — import constraints that prevent degeneration
- [09 — QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) — concrete React/Zustand/TanStack/tRPC patterns
