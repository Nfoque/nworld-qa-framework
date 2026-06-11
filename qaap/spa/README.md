# QAAP SPA

React single-page application for QAAP — QA Automation Platform.

## Tech Stack

React 19, Vite 8, TypeScript 6, MUI v9, TanStack Query v5, TanStack Router, Supabase Auth.

## Structure

```
src/
├── domains/                    # Feature modules (VSA)
│   ├── connectors/             # Connector management (list, configure, test)
│   └── dashboard/              # Home dashboard (stats, plans, executions, activity)
│
├── shared/                     # Cross-cutting concerns
│   ├── auth/                   # AuthProvider, route guards, login page
│   ├── components/             # Reusable UI (stat-card, badges, snackbar, loading)
│   ├── config/                 # Supabase client
│   ├── layout/                 # AppLayout, Sidebar
│   ├── tenant/                 # TenantProvider (multi-tenant context)
│   └── theme/                  # MUI theme
│
├── main.tsx                    # Entry point (providers + render)
└── router.tsx                  # TanStack Router route tree
```

## Commands

```bash
npm install                     # Install dependencies
npm run dev                     # Dev server at http://localhost:5173
npm run build                   # tsc + vite build
npm run lint                    # ESLint check
npm run lint:fix                # ESLint auto-fix
npm run format                  # Prettier write
npm run types:check             # tsc --noEmit
npm run check                   # lint:fix + format + types + build (full verification)
```

## Architecture

Follows VSA (Vertical Slice Architecture) as defined in [documentation/adr/](../documentation/adr/):
- Each domain owns its features end-to-end
- Shared layer provides cross-cutting concerns (auth, layout, theme)
- No barrel files — direct imports only
- All backend communication through Supabase Edge Functions (zero direct DB queries)

See [QAAP CLAUDE.md](../CLAUDE.md) for full development details.
