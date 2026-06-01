## Workflow 1 — Find missing scenarios from a user story

**The prompt:**

```bash
You are a senior QA engineer reviewing test coverage for a Playwright Python test suite.
```

```csharp
Workflow 1 — Find missing scenarios from a user storyUser story:
[paste user story]Acceptance criteria:
[paste acceptance criteria]Existing tests:
[paste your test file]Review the tests against the acceptance criteria and:
1. List any scenarios from the acceptance criteria NOT covered by the tests
2. List any edge cases and boundary conditions not covered
3. Rate the overall coverage as Low / Medium / High with a brief reason
```

**Real example — checkout flow:**

I ran this on our checkout test suite. The acceptance criteria had 8 points. My tests covered 6. Claude flagged:

-   ❌ No test for applying an expired discount code
-   ❌ No test for checkout when the user’s saved card has expired
-   ✅ Everything else covered

Two gaps in under 10 seconds. Both were genuine risks that would have reached production.

## Workflow 3 — Traceability check without a dedicated tool

Traceability matrices are painful to maintain manually. AI gives you a lightweight version for free.

**The prompt:**

```sql
Below are my user stories and my test functions.
Map each test function to the user story or acceptance criterion it covers.
Flag any user stories with no corresponding test.
```

```bash
User stories:
[paste user stories]Test functions (names only):
[paste list of test function names]
```

Example output:

```scss
Workflow 3 — Traceability check without a dedicated toolUS-01 (Login with valid credentials) → test_should_redirect_to_dashboard_when_credentials_are_valid ✅
US-02 (Login with invalid password) → test_should_show_error_when_password_is_incorrect ✅
US-03 (Account lockout after 5 attempts) → test_should_lock_account_after_five_failed_attempts ✅
US-04 (Remember me functionality) → ❌ NO TEST FOUND
US-05 (Password reset flow) → ❌ NO TEST FOUND
```

Two user stories with zero coverage, surfaced in seconds. No spreadsheet needed.

## Workflow 4 — Automate the gap check on every PR

This is the power move. Instead of running the coverage review manually, trigger it automatically when a pull request is raised.

Here’s a GitHub Actions workflow that runs a coverage gap check using the Claude API:

```

name: AI Coverage Gap Check
```

```yaml
on:
  pull_request:
    paths:
      - 'tests/**'jobs:
  coverage-check:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'      - name: Install dependencies
        run: pip install anthropic      - name: Run coverage gap check
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python scripts/coverage_gap_check.py
```

And the script:

```javascript

import os
import anthropic
from pathlib import Path
```

```python
Workflow 4 — Automate the gap check on every PRdef get_test_files():
    test_dir = Path("tests")
    return "\n\n".join(
        f"# {f.name}\n{f.read_text()}"
        for f in test_dir.glob("test_*.py")
    )def check_coverage_gaps():
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    test_content = get_test_files()    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""Review these Playwright Python tests for coverage gaps.
List only HIGH risk missing scenarios — maximum 5 items.
Be concise. Format as a bullet list.Tests:
{test_content}"""
            }
        ]
    )    gaps = message.content[0].text
    print("=== AI Coverage Gap Check ===")
    print(gaps)    # Fail the build if high-risk gaps are found
    if "high" in gaps.lower():
        print("\n⚠️  High-risk coverage gaps found. Review before merging.")
        exit(1)if __name__ == "__main__":
    check_coverage_gaps()
```

Every PR now gets an automated coverage review. High-risk gaps block the merge until addressed.