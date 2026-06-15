# Migration Guide

> Step-by-step process for transforming a traditional SPA into VSA + Domain architecture.

## Prerequisites

Before migrating, ensure:
- The project has more than 10 features (otherwise plain VSA without domains may suffice)
- The team uses AI agents in the development workflow
- The existing architecture is layer-based (components/, hooks/, services/, store/)

## Phase 1 — Domain Mapping (no code changes)

### 1.1 Identify domains

List the functional business areas the application covers. Use Product Owner vocabulary:

```
Example for QAAP:
- plans        (test plan creation, editing, approval)
- pipeline     (generation, review, codification)
- connectors   (Jira, GitHub, S3 integration config)
- execution    (test runs, scheduling, results)
- health       (trends, flaky tracking, alerts)
- proposals    (AI-driven fix proposals)
```

### 1.2 Map features to domains

For each existing page/component/module, assign it to a domain:

```
PlanList          → plans/plan-list
PlanDetail        → plans/plan-detail
PlanWizard        → plans/plan-wizard
ConnectorSetup    → connectors/connector-setup
ExecutionView     → execution/execution-view
HealthDashboard   → health/health-dashboard
```

### 1.3 Identify shared code

Classify existing shared code into:
- **Global shared** — used across 3+ domains (auth, layout, theme, tRPC client)
- **Domain shared** — used by 3+ features of one domain
- **Feature-local** — used by only one feature (move into the feature)

## Phase 2 — Create Structure (parallel to existing)

### 2.1 Create the domain folders

```bash
mkdir -p src/domains/{plans,pipeline,connectors,execution,health,proposals}/{features,shared}
mkdir -p src/shared/{api,auth,layout,theme,i18n,components,assets}
```

### 2.2 Add README.md to each domain

Use the template from [04 — Domain Layer](./04-domain-layer.md).

## Phase 3 — Move Features (one at a time)

For each feature, in order from least coupled to most coupled:

### 3.1 Create the feature folder

```bash
mkdir -p src/domains/plans/features/plan-list
```

### 3.2 Move files into the feature

```bash
mv src/pages/PlanList.tsx src/domains/plans/features/plan-list/plan-list.tsx
mv src/__tests__/PlanList.test.tsx src/domains/plans/features/plan-list/plan-list.test.tsx
mv src/styles/PlanList.css src/domains/plans/features/plan-list/plan-list.css
```

### 3.3 Create feature-specific files

- `plan-list.service.ts` — extract API calls into a TanStack Query / tRPC hook
- `plan-list.types.ts` — extract types from global type files, add adapter from API models
- `plan-list.adapter.ts` — API response → domain model

### 3.4 Update imports

Update all imports to point to the new location. Use search-and-replace:

```bash
grep -r "from.*pages/PlanList" src/
```

### 3.5 Verify

```bash
pnpm types:check && pnpm test && pnpm lint
```

### 3.6 Repeat for next feature

## Phase 4 — Move Shared Code

### 4.1 Global shared

Move truly cross-domain code to `src/shared/`:

```bash
mv src/hooks/use-auth.ts src/shared/auth/use-auth.ts
mv src/components/Layout.tsx src/shared/layout/layout.tsx
mv src/api/trpc.ts src/shared/api/trpc.ts
```

### 4.2 Domain shared

Identify code used by 3+ features of one domain:

```bash
# If plan-types.ts is used by plan-list, plan-detail, and plan-wizard (all in plans/):
mv src/types/plan-types.ts src/domains/plans/shared/plan-types/plan-types.ts
```

### 4.3 Feature-local code

Move code used by only one feature into that feature's folder:

```bash
# If usePlanValidation is only used by plan-wizard:
mv src/hooks/usePlanValidation.ts src/domains/plans/features/plan-wizard/use-plan-validation.ts
```

## Phase 5 — Clean Up

### 5.1 Remove empty directories

```bash
find src/pages src/components src/hooks src/services -empty -delete
```

### 5.2 Update routes

Point TanStack Router file-based routes to domain-based imports:

```typescript
// routes/_authenticated/plans/index.tsx
import { PlanList } from "@/domains/plans/features/plan-list/plan-list";
```

### 5.3 Add ESLint import boundaries

See [05 — Structural Rules](./05-structural-rules.md) for the ESLint config.

### 5.4 Final verification

```bash
pnpm lint && pnpm types:check && pnpm test
pnpm dev      # dev server works
pnpm build    # production build succeeds
```

## Migration Order Recommendation

1. Start with the **smallest, most isolated feature** — build confidence
2. Move features **within one domain at a time** — avoid half-migrated domains
3. Move **shared code last** — once all features are in place, shared boundaries are clear
4. Don't migrate and refactor simultaneously — separate the structural move from logic changes

## Related Docs

- [02 — Directory Structure](./02-directory-structure.md) — target structure
- [05 — Structural Rules](./05-structural-rules.md) — rules to enforce after migration
- [15 — When NOT to Use](./15-when-not-to-use.md) — verify VSA applies before migrating
