# Mock Server

> QAAP-specific: MSW-based mocking for local development and E2E testing.

## Purpose

The mock layer enables:
- **Frontend development** without a running backend or Supabase
- **E2E testing** with deterministic, reproducible responses
- **Isolated feature development** — work on UI without waiting for API implementation

## Approach: MSW (Mock Service Worker)

QAAP uses [MSW](https://mswjs.io/) to intercept network requests at the service worker level. This means the same mock definitions work in:
- **Browser** (development) — via service worker
- **Vitest** (unit/integration tests) — via Node.js interceptor
- **Playwright** (E2E tests) — via network route interception

## Architecture

```
src/
  mocks/
    handlers/
      plan.ts              ← Handlers for plan-related tRPC procedures
      connector.ts         ← Handlers for connector procedures
      execution.ts         ← Handlers for execution procedures
      auth.ts              ← Handlers for auth flows
    fixtures/
      plans.json           ← Sample plan data
      scenarios.json       ← Sample scenario data
      connectors.json      ← Sample connector configs
    browser.ts             ← MSW browser setup (service worker)
    server.ts              ← MSW server setup (Node.js, for tests)
    handlers.ts            ← Aggregates all handlers
```

## Handler Pattern

MSW handlers intercept tRPC batch requests. Since tRPC sends all queries as POST to a single endpoint, handlers match on the procedure name in the request body:

```typescript
// mocks/handlers/plan.ts
import { http, HttpResponse } from "msw";
import plans from "../fixtures/plans.json";

export const planHandlers = [
  http.post("/api/trpc/plan.list", () => {
    return HttpResponse.json({
      result: { data: plans },
    });
  }),

  http.post("/api/trpc/plan.getById", async ({ request }) => {
    const body = await request.json();
    const plan = plans.find((p) => p.id === body.input);
    if (!plan) return HttpResponse.json({ error: { message: "Not found" } }, { status: 404 });
    return HttpResponse.json({ result: { data: plan } });
  }),

  http.post("/api/trpc/plan.create", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      result: { data: { id: "new-plan-id", ...body.input } },
    });
  }),
];
```

## Browser Setup (Development)

```typescript
// mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

```typescript
// main.tsx
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === "true") {
    const { worker } = await import("./mocks/browser");
    return worker.start({ onUnhandledRequest: "bypass" });
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
```

Start with mocking:
```bash
VITE_MOCK_API=true pnpm dev
```

## Test Setup (Vitest)

```typescript
// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```typescript
// vitest.setup.ts
import { server } from "./src/mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Override handlers in specific tests:

```typescript
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

test("shows error state when API fails", async () => {
  server.use(
    http.post("/api/trpc/plan.list", () => {
      return HttpResponse.json({ error: { message: "Server error" } }, { status: 500 });
    }),
  );
  // ... render and assert
});
```

## Adding a New Mock

1. Create or update a fixture in `mocks/fixtures/`
2. Add handler(s) in `mocks/handlers/{domain}.ts`
3. Export from `mocks/handlers.ts`

No route registration or server restart needed — MSW picks up changes via hot reload.

## Supabase Local as Alternative

For integration testing that needs real database behavior, use the local Supabase stack instead of MSW:

```bash
cd backend && supabase start     # PostgreSQL + Auth + Edge Functions locally
```

This gives a real database with RLS policies, auth flows, and Edge Functions — useful for testing the full stack without mocks.

## Related Docs

- [13 — E2E Testing](./13-e2e-testing.md) — Playwright using MSW or network interception
- [14 — Developer Environment](./14-developer-environment.md) — scripts and environments
