# ADR-002: Playwright E2E with multi-environment and XRay integration

> Status: **accepted**
> Date: 2026-06-02
> Origin: internal pilot — ADR 13 (E2E testing)

## Context

E2E tests need to run both against a local mock server (fast, deterministic CI)
and against a real pre-production backend (real validation). Additionally, results
must be linked to Jira via XRay for traceability.

## Decision

Playwright with two projects (`mock` and `pre`), and `@XRAY-{JIRA-KEY}` tags for
Jira integration.

## Recommended structure

```
e2e/
  playwright.config.ts              ← Projects: mock (localhost) + pre (pre-production)
  global-setup.ts                   ← Starts mock server if project=mock
  fixtures/
    auth.setup.ts                   ← Auth mock (injected session) or real auth (depending on environment)
  specs/
    {feature}.spec.ts               ← @XRAY-{KEY} in describe
  reporters/
    xray-reporter.ts                ← Extracts @XRAY tags, exports JUnit XML or calls XRay API
```

## Environments

| Project | Backend | Auth | Usage |
|---|---|---|---|
| `mock` | Mock server (localhost) | Injected session | CI, fast feedback, deterministic |
| `pre` | Real backend (pre-production) | Project's real auth | Validation against real backend |

## Spec conventions

- `test.describe("@XRAY-PROJ-1234 Feature Name", ...)` for Jira traceability
- `page.getByTestId()` as the primary locator (deterministic, not coupled to CSS)
- `page.route()` to simulate API errors in specific tests

## NPM Scripts

```json
{
  "test:e2e": "playwright test --project=mock",
  "test:e2e:pre": "playwright test --project=pre",
  "test:e2e:report": "playwright show-report"
}
```

## Research principles applied

- **Build-time vs run-time** (`research/insights.md`): Spec generation is build-time (skill).
  Execution is run-time (Playwright CLI in CI). They don't mix.
- **Validation by parallel execution** (`research/insights.md`): Mock and pre are parallel execution
  of the same suite against two backends — discrepancy signals real problems.
- **Severity matches block-severity** (`research/insights.md`): Mock tests block merge (deterministic).
  Pre tests generate warnings (depend on external infra).

## Origin

- Full config: internal pilot — ADR 13 (E2E testing)
- Mock server: internal pilot — ADR 12 (mock server)
