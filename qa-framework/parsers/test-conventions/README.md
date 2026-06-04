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

The output MUST be formatted as a **strict convention contract**, not as descriptive statistics.
Prohibitive rules ("PROHIBITED", "NEVER", "ONLY") produce ~95% LLM compliance.
Descriptive guidelines ("prefer", "80% usage") produce ~70%.
(Source: Nesvitii — MCP + Playwright + Jira E2E Automation, confirmed by Kastner postmortem)

### Bad output (descriptive — ~70% compliance):
```
Conventions detected in e2e/:
- Preferred locator: getByTestId (80% usage), getByRole (15%), getByText (5%)
- beforeEach pattern: navigate to route + wait for load
```

### Good output (strict contract — ~95% compliance):
```
## SELECTORS
- ONLY use data-testid attributes: page.getByTestId('submit-btn')
- CSS class selectors: PROHIBITED
- XPath: PROHIBITED
- Text-based selectors: allowed ONLY as fallback for third-party components without data-testid

## IMPORTS
- ONLY use: import { test, expect } from "@playwright/test"
- NEVER import from @playwright/test/lib or internal modules

## HELPERS
- Available: loginAsUser(page, role) in e2e/fixtures/helpers.ts
- NEVER create new helper functions — use existing ones or write inline
- NEVER use test.beforeEach() for auth — use the authed fixture

## STRUCTURE
- Describe prefix: @XRAY-{KEY}
- Test names: English, format "verb + expected result"
- Test grouping order: render → interaction → error → edge cases
- ONE spec per component/feature — NEVER combine unrelated features

## ALREADY COVERED (do not duplicate)
- dashboard/home
- catalog/list-products
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
