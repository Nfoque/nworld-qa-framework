# Create E2E Spec

Create a Playwright E2E test spec mapped to a feature, with optional XRay/Jira integration.

## Input

$ARGUMENTS = `{domain}/{feature-name}` and optionally a Jira ticket key (e.g., `catalog/list-products ICMF-1234`)

## Instructions

1. Read `architecture/adr-002-playwright-setup.md` for the multi-environment setup and XRay integration.

2. Parse the input:
   - Extract domain and feature name
   - Extract optional Jira ticket key (for XRay tag)
   - Verify the feature exists in `src/domains/{domain}/features/{feature-name}/`

3. Read the feature's main component to understand:
   - What `data-testid` attributes are used (these are the ONLY valid testIds)
   - What user interactions are available (buttons, links, forms, selects)
   - What routes it maps to (check the router)
   - What API calls it makes (check service/hook files)

4. If the project has an OpenAPI spec (check `node_modules/@inditex-api/*/openapi-rest.yml` or `../specification/`):
   - Find the matching endpoints for this feature
   - Extract response schemas and error responses (4xx, 5xx)

5. If existing E2E specs exist in `e2e/domains/`:
   - Detect conventions (imports, helpers, locator preferences, beforeEach pattern)
   - Do not duplicate specs for features already covered

6. Create the spec file at `e2e/domains/{domain}/{feature-name}.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("{xray-tag}{Feature Name}", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/{route-to-feature}");
  });

  test("renders the main view", async ({ page }) => {
    await expect(page.getByTestId("{real-testid}")).toBeVisible();
  });

  // Tests for user interactions (based on component analysis)
  // Tests for error states (based on OpenAPI error responses)
  // Tests for edge cases
});
```

If a Jira key was provided, include it as `@XRAY-{JIRA-KEY} ` prefix in the describe block title.

7. If the feature has API calls:
   - Add a mock fixture test that intercepts the API call
   - Add an error handling test using `page.route()`:
   ```typescript
   test("handles API error gracefully", async ({ page }) => {
     await page.route("**/api/v1/{endpoint}", (route) =>
       route.fulfill({ status: 500 })
     );
     await page.goto("/{route}");
     await expect(page.getByTestId("{error-testid}")).toBeVisible();
   });
   ```

8. Report what was created and how to run it:
   ```
   pnpm test:e2e -- --grep "{Feature Name}"
   pnpm test:e2e:pre -- --grep "{Feature Name}"
   ```

## Rules

- **testIds: only from the component.** Only use `getByTestId()` with IDs found as `data-testid` in the component source. Never invent or extrapolate testIds.
- **Fallback when no testId:** use `getByRole()` with `{ name: "..." }`. Mark with `// no testId — fallback to getByRole`.
- **Low confidence:** if >30% of locators are fallback, report `⚠ review recommended: X/Y locators without testId`.
- Prefer `getByRole()` over `getByText()` for interactive elements.
- Assertions on properties (visible, count, enabled), not literal text.
- One describe per spec, beforeEach with route navigation.
- Test names describe behavior, not implementation.
