# Create E2E Spec

Create a Playwright E2E test spec mapped to a feature.

## Input

$ARGUMENTS = `{domain}/{feature-name}` (e.g., `plans/plan-list`, `connectors/connector-setup`)

## Instructions

1. Read `documentation/adr/13-e2e-testing.md` for the E2E approach and multi-environment setup.

2. Parse the input:
   - Extract domain and feature name
   - Verify the feature exists in `src/domains/{domain}/features/{feature-name}/`

3. Read the feature's main component to understand:
   - What `data-testid` attributes are used
   - What user interactions are available
   - What routes it maps to

4. Create the spec file:

### `e2e/domains/{domain}/{feature-name}.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("{Feature Name}", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/{route-to-feature}");
  });

  test("renders the main view", async ({ page }) => {
    await expect(page.getByTestId("{feature-name}")).toBeVisible();
  });

  test("displays expected content", async ({ page }) => {
    // TODO: Verify key content elements
  });

  // TODO: Add tests for user interactions
  // TODO: Add tests for error states
  // TODO: Add tests for edge cases
});
```

5. Create the spec directory if it doesn't exist:
   ```
   mkdir -p e2e/domains/{domain}/
   ```

6. Check if `e2e/playwright.config.ts` includes the correct `testDir` setting. If not, note the adjustment needed.

7. If the feature has API calls (check for `.service.ts`):
   - Add an error handling test using `page.route()` to simulate failures:
   ```typescript
   test("handles API error gracefully", async ({ page }) => {
     await page.route("**/api/trpc/{procedure}*", (route) =>
       route.fulfill({ status: 500 }),
     );
     await page.goto("/{route}");
     // Verify error UI
   });
   ```

8. Report what was created and how to run it:
   ```
   cd e2e
   npx playwright test --project=local --grep "{Feature Name}"
   ```
