# Directory Structure

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 05

## Generic Pattern (stack-agnostic)

```
my-project/
├── README.md                        ← repository index
├── src/
│   ├── domains/                     ← functional grouping
│   │   ├── billing/
│   │   │   ├── README.md            ← domain description
│   │   │   ├── features/
│   │   │   │   ├── create-invoice/
│   │   │   │   │   ├── README.md    ← what this feature does
│   │   │   │   │   ├── handler.*
│   │   │   │   │   ├── service.*
│   │   │   │   │   ├── types.*
│   │   │   │   │   └── handler.test.*
│   │   │   │   ├── send-invoice/
│   │   │   │   ├── invoice-list/
│   │   │   │   └── payment-receipt/
│   │   │   └── shared/              ← shared ONLY within billing
│   │   │
│   │   ├── reports/
│   │   │   ├── README.md
│   │   │   ├── features/
│   │   │   │   ├── monthly-summary/
│   │   │   │   ├── data-export/
│   │   │   │   └── chart-renderer/
│   │   │   └── shared/
│   │   │
│   │   └── notifications/
│   │       ├── README.md
│   │       ├── features/
│   │       └── shared/
│   │
│   ├── shared/                      ← shared across ALL domains
│   │   ├── http/
│   │   ├── logging/
│   │   └── utilities/
│   │
│   └── app/                         ← composition and infrastructure
│       └── ...
```

The only things that change between stacks are the concrete file names. The conceptual structure is always the same.

## Adapted to QAAP (React 19 + Vite + MUI + TanStack)

```
src/
  domains/
    dashboard/
      README.md
      features/
        home/
          home.tsx                    ← React component (entry point)
          home.css                    ← Styles
          home.test.tsx              ← Colocated test
          home-card.tsx              ← Internal subcomponent
          README.md
      shared/

    plans/
      README.md
      features/
        plan-list/
          plan-list.tsx              ← Component
          plan-list.css              ← Styles
          plan-list.service.ts       ← TanStack Query hooks + keyFactory
          plan-list.types.ts         ← Frontend domain models
          plan-list.adapter.ts       ← API model → Frontend model
          plan-list.test.tsx         ← Tests
          README.md
      shared/
        plan-store/                  ← Domain-scoped Zustand store

  shared/                            ← Cross-domain
    api/                             ← tRPC client, query client
    auth/                            ← Supabase Auth provider
    layout/                          ← Shell layout, sidebar, navigation
    theme/                           ← MUI theme, tenant branding
    i18n/                            ← i18n shared translations
    components/                      ← Truly global components
    assets/                          ← Images, global styles
```

## Three Levels of README

| Level | Size | Purpose |
|---|---|---|
| Root | 20-30 lines | First-level index: list of domains and cross-cutting folders |
| Domain | 30-50 lines | Translate business language: concepts, features, dependencies, rules |
| Feature | 5-8 lines | What it does and how to invoke it. Auto-generable by agents |

More documentation is counterproductive: it increases context cost without adding precision.

## Related Docs

- [03 — Feature Anatomy](./03-feature-anatomy.md) — what goes inside each feature folder
- [04 — Domain Layer](./04-domain-layer.md) — how to delimit and organize domains
- [09 — QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) — concrete mapping to React 19/Vite/MUI/TanStack
