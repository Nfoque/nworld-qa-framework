# XRay Reporter — Design

> Origin: internal pilot — ADR 13 (E2E testing)

## Flow

```
Playwright runs specs
  → XRayReporter extracts @XRAY-{KEY} from each test.describe
  → Accumulates results: { key: "ICMF-1234", status: "PASS" | "FAIL" }
  → On completion:
    → Option A: Exports JUnit XML (for manual import or CI pipeline)
    → Option B: Calls XRay API directly (automatic push)
```

## Tag convention

```typescript
// The tag goes in the describe, not in the individual test
test.describe("@XRAY-ICMF-1234 List Products", () => {
  test("renders table", ...);  // → result linked to ICMF-1234
  test("filters by status", ...);  // → same
});
```

If a test inside the describe fails, the ticket result is FAIL.
It is PASS only if all tests in the describe pass.

## Implementation (skeleton)

```typescript
import type { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";

class XRayReporter implements Reporter {
  private results = new Map<string, { pass: number; fail: number }>();

  onTestEnd(test: TestCase, result: TestResult) {
    const match = test.parent.title.match(/@XRAY-(\S+)/);
    if (!match) return;

    const key = match[1];
    const entry = this.results.get(key) ?? { pass: 0, fail: 0 };

    if (result.status === "passed") entry.pass++;
    else entry.fail++;

    this.results.set(key, entry);
  }

  async onEnd(_result: FullResult) {
    const report = [...this.results.entries()].map(([key, { pass, fail }]) => ({
      testKey: key,
      status: fail > 0 ? "FAIL" : "PASS",
      tests: pass + fail,
    }));

    // TODO: Export as JUnit XML or call XRay API
    console.log("XRay results:", JSON.stringify(report, null, 2));
  }
}

export default XRayReporter;
```

## Configuration in playwright.config.ts

```typescript
export default defineConfig({
  reporter: [
    ["html"],
    ["./reporters/xray-reporter.ts"],
  ],
});
```

## Status

Design complete. Implementation pending — requires deciding whether to use JUnit XML export
(simpler, works with any CI) or direct XRay API (more integrated, requires
authentication and configuration).
