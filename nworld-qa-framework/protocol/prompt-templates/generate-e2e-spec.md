# Generate E2E Spec

> Prompt template for generating a Playwright E2E spec from a component.
> Promoted from the internal pilot — skill `create-e2e-spec`
> Adapted for the nworld-qa framework (context enriched with parsers).

## Input

Path to the component or feature, and optionally a Jira ticket key (e.g.: `src/pages/products/ PROJ-1234`)

## Prior context (injected by the pipeline)

Before executing this template, the pipeline (v0.1-generation-protocol.md) has already run
the parsers and assembled the context. The LLM receives:

- **Component**: structure, testIds, user interactions
- **API calls**: endpoints, query keys
- **OpenAPI context** (if available): response schemas, error states
- **Jira context** (if available): acceptance criteria, flows
- **Conventions** (if existing tests are present): patterns, imports, helpers

## Instructions

1. Read the component to understand:
   - Which `data-testid` attributes exist (use only these for `getByTestId`)
   - Which user interactions are possible (clicks, forms, navigation)
   - Which route the component maps to

2. Create the spec file:

```typescript
import { test, expect } from "@playwright/test";

test.describe("{xray-tag}{Feature Name}", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/{route-to-feature}");
  });

  test("renders the main view", async ({ page }) => {
    await expect(page.getByTestId("{real-testid}")).toBeVisible();
  });

  // Interaction tests (based on component)
  // Data tests (based on OpenAPI response schema)
  // Error tests (based on OpenAPI error responses)
  // Flow tests (based on Jira acceptance criteria)
});
```

3. If there is a Jira key, include `@XRAY-{JIRA-KEY} ` as a prefix in the describe.

4. If the component has API calls:
   - Add an error test with `page.route()`:
   ```typescript
   test("handles API error gracefully", async ({ page }) => {
     await page.route("**/api/v1/{endpoint}", (route) =>
       route.fulfill({ status: 500 })
     );
     await page.goto("/{route}");
     await expect(page.getByText("Something went wrong")).toBeVisible();
   });
   ```

5. If there are Jira acceptance criteria, generate one test per criterion with a
   descriptive name that reflects the AC.

6. Mark with `// TODO: review — low confidence` any assertion where the testId
   is inferred (not found literally in the component).

7. Report what was created and how to run it:
   ```
   pnpm test:e2e -- --grep "{Feature Name}"
   pnpm test:e2e:pre -- --grep "{Feature Name}"
   ```

## Rules

- **testIds: only those from the context.** Valid testIds are exclusively those listed
  in the `testIds found` block of the context injected by the source code parser.
  They are not invented, not inferred, not extrapolated from component names.
- **Fallback when there is no testId:** if an interactive element has no testId, use
  `getByRole()` with `{ name: "..." }`. Never `getByText()` for interactions. Mark
  the locator with `// no testId — fallback to getByRole`.
- **Low confidence:** if more than 30% of the spec's locators are fallback (not from
  testIds in the context), the entire spec is marked with confidence < 85% and reported
  at the end as `⚠ review recommended: X/Y locators without testId`.
- Prefer `getByRole()` over `getByText()` for interactive elements
- Assertions on properties (visible, count, enabled), not on literal text
- One describe per spec, beforeEach with navigation to the route
- Test name describes the behavior, not the implementation
