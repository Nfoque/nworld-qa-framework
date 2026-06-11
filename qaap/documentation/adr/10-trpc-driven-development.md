# tRPC-Driven Development

> QAAP-specific pattern: using tRPC as the single source of truth for API types, hooks, and client-server contracts.

## The Pattern

QAAP uses tRPC v11 for all communication between the SPA and the Fastify backend. tRPC provides **end-to-end type safety without code generation** — the router definition on the backend is the contract, and the frontend gets fully typed hooks automatically.

```
Backend (Fastify)                    Frontend (React)
┌─────────────────┐                  ┌─────────────────┐
│  tRPC Router     │                  │  tRPC Client     │
│  plan.list       │ ◄── types ──►   │  trpc.plan.list  │
│  plan.create     │   (inferred)    │  .useQuery()     │
│  plan.getById    │                  │  .useMutation()  │
└─────────────────┘                  └─────────────────┘
```

No separate OpenAPI spec, no code generation step, no type drift.

## tRPC Client Setup

### `src/shared/api/trpc.ts`

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@qaap/api/src/trpc/router";

export const trpc = createTRPCReact<AppRouter>();
```

The `AppRouter` type is imported from the backend package — this is the only cross-package type import needed. Turborepo ensures the backend builds first.

## The Adapter Pattern

tRPC responses are typed but still **API models, not frontend domain models**. Each feature defines its own types and adapts via a pure function:

```typescript
// plan-list.types.ts — domain model (what the UI needs)
export type PlanListItem = {
  id: string;
  name: string;
  modality: "web" | "api" | "ios";
  status: PlanStatus;
  scenarioCount: number;
  lastUpdated: Date;
};
```

```typescript
// plan-list.adapter.ts — boundary between API and domain
import type { RouterOutput } from "@/shared/api/trpc";
import type { PlanListItem } from "./plan-list.types";

type PlanListResponse = RouterOutput["plan"]["list"];

export const adaptPlanList = (data: PlanListResponse): PlanListItem[] =>
  data.map((plan) => ({
    id: plan.id,
    name: plan.name,
    modality: plan.modality,
    status: plan.status,
    scenarioCount: plan.scenarios.length,
    lastUpdated: new Date(plan.updatedAt),
  }));
```

```typescript
// plan-list.service.ts — TanStack Query hook via tRPC
import { trpc } from "@/shared/api/trpc";
import { adaptPlanList } from "./plan-list.adapter";

export const usePlanList = (filters: PlanFilters) =>
  trpc.plan.list.useQuery(filters, {
    select: adaptPlanList,
  });
```

### Key: TanStack Query `select`

The adapter runs in `select`, not in `queryFn`. This means:

- The **cache stores the raw API response** (full fidelity)
- The **component receives the domain model** (shaped for the UI)
- Multiple hooks can reuse the same cached query with different `select` projections
- The adapter is a pure function — trivially testable

### Why Adapters When tRPC Already Types Everything?

- **Decoupling**: backend schema changes don't cascade through the UI — only the adapter changes
- **Shape optimization**: the frontend model has exactly what the UI needs
- **Testability**: adapters are pure functions, trivially testable
- **Naming**: frontend uses domain language, not API field names
- **Computed fields**: derived values (counts, formatted dates) belong in the adapter, not the component

## Feature File Structure

```
domains/{domain}/features/{feature}/
  {feature}.tsx          — component (only knows domain types)
  {feature}.types.ts     — domain models (independent of API types)
  {feature}.adapter.ts   — pure functions: API response → domain model
  {feature}.service.ts   — tRPC hooks (uses adapter in select)
  {feature}.test.tsx     — tests
  {feature}.css          — styles
```

### Separation Rules

1. **Adapters always in their own `*.adapter.ts` file** — never inline in the service
2. **Domain types never import API types** — they are defined independently
3. **Only the adapter bridges API and domain** — it's the single boundary

```
tRPC response ──→ adapter.ts (boundary) ──→ types.ts (domain) ←── component.tsx (UI)
                       ↑                          ↑
                   service.ts (uses adapter) ─────┘
```

## Mutations

Mutations follow the same pattern but with optimistic updates and cache invalidation:

```typescript
// create-plan.service.ts
import { trpc } from "@/shared/api/trpc";

export const useCreatePlan = () => {
  const utils = trpc.useUtils();

  return trpc.plan.create.useMutation({
    onSuccess: () => {
      utils.plan.list.invalidate();
    },
  });
};
```

For mutations, adapters are typically not needed — the input shape matches what the form collects. If transformation is needed, create an `{feature}.adapter.ts` with a `toCreatePlanInput()` function.

## Supabase Realtime (SSE/WebSocket)

For real-time features (pipeline progress, execution status), use Supabase Realtime subscriptions alongside tRPC:

```typescript
// execution-live.service.ts
import { useEffect } from "react";
import { supabase } from "@/shared/api/supabase";

export const useExecutionLive = (executionId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`execution:${executionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "executions", filter: `id=eq.${executionId}` }, (payload) => {
        // Update local state or invalidate query
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [executionId]);
};
```

## Related Docs

- [09 — QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) — TanStack Query and tRPC patterns
- [12 — Mock Server](./12-mock-server.md) — how to mock tRPC calls
- [03 — Feature Anatomy](./03-feature-anatomy.md) — where adapters and services live
- [14 — Developer Environment](./14-developer-environment.md) — local development setup
