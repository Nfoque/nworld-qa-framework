# QAAP Stack Adaptation

> Maps VSA + Domain concepts to the concrete QAAP technology stack.

## Stack Overview

| Layer | Technology |
|---|---|
| UI framework | React 19 + TypeScript 5.x |
| Design system | MUI (Material UI) v6 |
| Build | Vite 6 |
| Server state | TanStack Query 5 (`@tanstack/react-query`) |
| Client state | Zustand 5 |
| Routing | TanStack Router (file-based, type-safe) |
| API | tRPC v11 (`@trpc/react-query`) |
| Auth | Supabase Auth |
| Testing | Vitest + React Testing Library |
| Package manager | pnpm |

## VSA ↔ QAAP Mapping

| VSA Concept | QAAP Implementation |
|---|---|
| Feature entry point | React functional component (`.tsx`) |
| Feature service | TanStack Query hook via tRPC (`.service.ts`) |
| Feature types | TS interfaces + adapter from API response (`.types.ts`) |
| Feature tests | Vitest + RTL, colocated (`.test.tsx`) |
| Domain shared | Zustand store, domain-specific hooks |
| Global shared | Auth, layout, theme, i18n, tRPC client, global components |
| Cross-domain communication | Global Zustand store in `src/shared/` or event emitter |
| Configuration | Environment variables via Vite (`import.meta.env`) |

## Server State: TanStack Query via tRPC

Server state (data from the API) is managed with TanStack Query through tRPC's React integration. This gives end-to-end type safety without code generation.

### tRPC Hook Pattern

Each feature defines its own service file that wraps tRPC calls:

```typescript
// plan-list.service.ts
import { trpc } from "@/shared/api/trpc";
import { adaptPlanListResponse } from "./plan-list.adapter";

export const usePlanList = (filters: PlanFilters) =>
  trpc.plan.list.useQuery(filters, {
    select: adaptPlanListResponse,
  });

export const useCreatePlan = () =>
  trpc.plan.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().plan.list.invalidate();
    },
  });
```

### keyFactory Pattern (for non-tRPC queries)

For queries outside tRPC (e.g., direct Supabase calls), use a keyFactory for hierarchical, invalidatable query keys:

```typescript
export const planKeyFactory = {
  all: () => ["plans"],
  list: (filters: PlanFilters) => [...planKeyFactory.all(), "list", filters],
  detail: (id: string) => [...planKeyFactory.all(), "detail", id],
};
```

## Client State: Zustand

Client state (UI state, non-server data) lives in Zustand stores.

- **Feature-scoped**: store inside the feature folder (used by that feature only)
- **Domain-scoped**: store in `domains/{X}/shared/` (used by multiple features of that domain)
- **Global**: store in `src/shared/` (rare — prefer TanStack Query for server data)

## Provider Hierarchy

The app wraps components in this order (outermost → innermost):

```
StrictMode
  └── Supabase AuthProvider
       └── TenantProvider (branding, config)
            └── MUI ThemeProvider (tenant-dynamic theme)
                 └── QueryClientProvider (TanStack Query)
                      └── tRPC Provider
                           └── RouterProvider (TanStack Router)
                                └── Layout
                                     └── Routes
```

## Routing: TanStack Router

File-based routing with type-safe params and search params:

```
src/routes/
  __root.tsx                     ← Root layout (sidebar, topbar)
  _authenticated/
    dashboard.tsx                ← /dashboard
    plans/
      index.tsx                  ← /plans (list)
      $planId.tsx                ← /plans/:planId (detail)
      new.tsx                    ← /plans/new (wizard)
    connectors/
      index.tsx                  ← /connectors
    settings/
      index.tsx                  ← /settings
      llm.tsx                    ← /settings/llm
      branding.tsx               ← /settings/branding
```

Routes are thin — they import and render domain features:

```typescript
// routes/_authenticated/plans/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PlanList } from "@/domains/plans/features/plan-list/plan-list";

export const Route = createFileRoute("/_authenticated/plans/")({
  component: PlanList,
});
```

## Tenant Branding

MUI ThemeProvider with a dynamically generated theme from tenant config:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: tenant.primaryColor },
    secondary: { main: tenant.accentColor },
  },
  typography: { fontFamily: tenant.fontFamily || "Inter" },
});
```

Tenant resolution: `{tenant-slug}.qaap.dev` (subdomain) or custom domain. On-prem single-tenant: slug hardcoded in env.

## Related Docs

- [10 — tRPC-Driven Development](./10-trpc-driven-development.md) — tRPC hooks and adapters
- [11 — Module Boundaries](./11-module-boundaries.md) — workspace packages and import rules
- [14 — Developer Environment](./14-developer-environment.md) — Vite, Supabase local, scripts
- [17 — MUI Design System](./17-mui-design-system.md) — component patterns and theming
