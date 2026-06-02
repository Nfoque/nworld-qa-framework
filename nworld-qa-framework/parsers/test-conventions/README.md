# Parser: Test Conventions

> Origin: internal pilot — `verify` skill

## What it does

Given an existing `e2e/` directory, it extracts the project's conventions:

1. **Import patterns** — which helpers, fixtures, and utils are used
2. **Spec structure** — how describe/test/beforeEach are organized
3. **Locator patterns** — getByTestId vs getByRole vs getByText (project preferences)
4. **Existing helpers** — reusable utility functions
5. **Current coverage** — which features already have a spec (to avoid duplication)

## Input

- Path to the E2E directory: `e2e/domains/`
- Optionally: path to fixtures and helpers

## Output (context for the prompt)

```
Conventions detected in e2e/:
- Import pattern: import { test, expect } from "@playwright/test"
- Available helper: loginAsUser(page, role) in e2e/fixtures/helpers.ts
- Preferred locator: getByTestId (80% usage), getByRole (15%), getByText (5%)
- beforeEach pattern: navigate to route + wait for load
- Existing specs: dashboard/home, catalog/list-products (do not duplicate)

Describe structure:
- @XRAY-{KEY} as describe prefix
- Test names in English, format "verb + expected result"
- Tests grouped by type: render → interaction → error → edge cases
```

## Output schema

```typescript
interface ConventionsContext {
  importPattern: string;
  locatorPreference: {
    getByTestId: number;
    getByRole: number;
    getByText: number;
  };
  helpers: {
    name: string;
    file: string;
    signature: string;
  }[];
  beforeEachPattern: string | null;
  describeNaming: string | null;
  coveredFeatures: string[];
}
```

## Existing base

The `verify` skill from the pilot already performs validation that includes analysis of testing
conventions:

What's missing:
- Analysis of existing E2E specs (today verify only looks at src/, not e2e/)
- Extraction of patterns and conventions (today it only looks for violations)
- Formatting as context for the generation prompt
