# Developer Environment

> QAAP-specific: scripts, environments, and the development workflow.

## Prerequisites

- Node >= 22
- pnpm >= 10
- Docker (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase`)

## Environment Matrix

| Environment | Backend | Auth | Command |
|---|---|---|---|
| `local + mock` | MSW (no backend needed) | Mocked | `VITE_MOCK_API=true pnpm dev` |
| `local + supabase` | Local Supabase stack | Local Supabase Auth | `supabase start && pnpm dev` |
| `preview` | Supabase cloud (preview branch) | Supabase Auth | `VITE_SUPABASE_URL=<url> pnpm dev` |

## pnpm Scripts

### SPA (`spa/`)

```bash
pnpm dev                               # Vite dev server at http://localhost:5173
pnpm build                             # Production build
pnpm preview                           # Preview production build locally
pnpm test                              # Vitest (unit + integration)
pnpm test:watch                        # Vitest in watch mode
pnpm test:coverage                     # With coverage report
pnpm lint                              # ESLint check
pnpm lint:fix                          # Auto-fix lint issues
pnpm format                            # Prettier formatting
pnpm types:check                       # TypeScript type checking (tsc --noEmit)
```

### Backend (`backend/`)

```bash
supabase start                         # Start local Supabase (PostgreSQL, Auth, Edge Functions)
supabase stop                          # Stop local Supabase
supabase db push                       # Push migrations to remote
supabase functions serve               # Serve Edge Functions locally with hot-reload
supabase functions deploy <name>       # Deploy a single Edge Function
supabase db reset                      # Reset local DB + re-run migrations + seed
```

## Environment Variables

### SPA (`spa/.env.local`)

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321         # Local Supabase URL
VITE_SUPABASE_ANON_KEY=<local-anon-key>           # From `supabase status`
VITE_MOCK_API=false                                # Set to "true" for MSW mocking
```

For connecting to a remote Supabase project:

```env
VITE_SUPABASE_URL=https://zxdbfubcisgcfentbstg.supabase.co
VITE_SUPABASE_ANON_KEY=<remote-anon-key>
```

## Local Development Workflow

### Option 1: Mock-only (fastest, no Docker)

For pure frontend development when the API shape is known:

```bash
cd spa
VITE_MOCK_API=true pnpm dev
```

MSW intercepts all tRPC calls and returns fixture data. No backend, no database, no Docker.

### Option 2: Full local stack

For integration work or testing real auth/RLS:

```bash
cd backend && supabase start            # Start PostgreSQL + Auth + Edge Functions
cd ../spa && pnpm dev                   # Start Vite dev server
```

Local Supabase provides:
- PostgreSQL with RLS policies at `localhost:54321`
- Auth server at `localhost:54321/auth/v1`
- Edge Functions at `localhost:54321/functions/v1`
- Studio dashboard at `localhost:54323`

## Ports

| Service | Port | Description |
|---|---|---|
| Vite dev server | 5173 | SPA at `http://localhost:5173` |
| Supabase API | 54321 | REST + Auth + Realtime |
| Supabase Studio | 54323 | Database management UI |
| Supabase DB | 54322 | PostgreSQL direct connection |

## E2E Testing

E2E tests live in `e2e/` (separate `package.json`). Playwright config at `e2e/playwright.config.ts`.

Two projects:
- **local** — runs against Vite dev server (auto-started via `webServer`)
- **preview** — runs against a deployed preview environment

```bash
cd e2e
npx playwright test --project=local          # Run local tests
npx playwright test --project=local --headed # With visible browser
npx playwright show-report                   # Open HTML report
```

## Related Docs

- [12 — Mock Server](./12-mock-server.md) — MSW setup details
- [13 — E2E Testing](./13-e2e-testing.md) — Playwright environments
- [10 — tRPC-Driven Development](./10-trpc-driven-development.md) — API development workflow
