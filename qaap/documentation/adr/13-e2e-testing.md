# E2E Testing

> QAAP-specific: Playwright-based E2E testing with multi-environment support.

## Approach

E2E specs are **mapped 1:1 to features**, mirroring the VSA domain structure. The E2E suite lives in its own `e2e/` directory at the project root, with its own `package.json` and Playwright dependency.

```
e2e/
  playwright.config.ts                   ← Multi-environment projects + webServer auto-start
  fixtures/
    auth.setup.ts                        ← Auth setup for authenticated environments
    .auth/                               ← Storage state files (gitignored)
  domains/
    plans/
      plan-list.spec.ts
      plan-detail.spec.ts
    connectors/
      connector-setup.spec.ts
    dashboard/
      dashboard.spec.ts
  results/                               ← JUnit XML + test artifacts (gitignored)
  playwright-report/                     ← HTML report (gitignored)
```

## Multi-Environment Configuration

The Playwright config defines two environments (`local` and `preview`) and uses `webServer` to auto-start the Vite dev server when running locally:

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const LOCAL_BASE_URL = "http://localhost:5173";
const PREVIEW_BASE_URL = process.env.PREVIEW_URL ?? "https://preview.qaap.dev";

export default defineConfig({
  testDir: "./domains",
  outputDir: "./results",
  timeout: 30_000,
  retries: 1,
  reporter: [
    ["html", { open: "never" }],
    ["junit", { outputFile: "./results/junit-report.xml" }],
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm --dir ../spa dev",
    url: LOCAL_BASE_URL,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "local",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: LOCAL_BASE_URL,
      },
    },
    {
      name: "preview",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: PREVIEW_BASE_URL,
        storageState: "./fixtures/.auth/preview.json",
      },
      dependencies: ["preview-auth"],
    },
    {
      name: "preview-auth",
      testMatch: /auth\.setup\.ts/,
    },
  ],
});
```

### Environments

| Project | Backend | Auth | Use case |
|---|---|---|---|
| `local` | MSW or local Supabase | Mocked or local Supabase Auth | CI, fast feedback, deterministic |
| `preview` | Supabase (preview branch) | Real Supabase Auth | Validation against real backend |

## Auth Setup

```typescript
// e2e/fixtures/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate against preview", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: "./fixtures/.auth/preview.json" });
});
```

The `local` project has no auth dependency — Supabase Auth can be bypassed in local development or mocked via MSW.

## Writing Specs

Specs live in `e2e/domains/`, mirroring the source domain structure:

```typescript
// e2e/domains/plans/plan-list.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Plan List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/plans");
  });

  test("displays the plan list", async ({ page }) => {
    await expect(page.getByTestId("plan-list")).toBeVisible();
  });

  test("can create a new plan", async ({ page }) => {
    await page.getByRole("button", { name: "New Test Plan" }).click();
    await expect(page).toHaveURL(/\/plans\/new/);
  });
});
```

### Conventions

- One `test.describe` per feature
- Use `page.goto("/relative-path")` — Playwright appends it to the project's `baseURL`
- Use `page.getByTestId()`, `page.getByRole()`, `page.getByLabel()` — prefer accessible selectors
- Assertions use structural properties (visible, enabled, count), not literal text content

## Network Mocking (for specific tests)

Playwright can intercept network requests directly for edge cases:

```typescript
test("handles API error gracefully", async ({ page }) => {
  await page.route("**/api/trpc/plan.list*", (route) =>
    route.fulfill({ status: 500, body: "Internal Server Error" }),
  );

  await page.goto("/plans");
  await expect(page.getByText("Something went wrong")).toBeVisible();
});
```

## Running Tests

```bash
# From the project root
cd e2e

# Run local project (default)
npx playwright test --project=local

# Run preview project
npx playwright test --project=preview

# Visible browser
npx playwright test --project=local --headed

# Filter by test name
npx playwright test --project=local --grep "plan"

# Open HTML report
npx playwright show-report
```

## Related Docs

- [12 — Mock Server](./12-mock-server.md) — MSW setup for mocking
- [03 — Feature Anatomy](./03-feature-anatomy.md) — feature structure that specs mirror
- [14 — Developer Environment](./14-developer-environment.md) — scripts and environments
