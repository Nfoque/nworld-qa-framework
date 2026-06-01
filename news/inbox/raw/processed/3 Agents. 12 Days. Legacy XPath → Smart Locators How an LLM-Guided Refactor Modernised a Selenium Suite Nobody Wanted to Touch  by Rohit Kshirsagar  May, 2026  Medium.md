## 3 Agents. 12 Days. Legacy XPath → Smart Locators: How an LLM-Guided Refactor Modernised a Selenium Suite Nobody Wanted to Touch

[

![Rohit Kshirsagar](3%20Agents.%2012%20Days.%20Legacy%20XPath%20%E2%86%92%20Smart%20Locators%20How%20an%20LLM-Guided%20Refactor%20Modernised%20a%20Selenium%20Suite%20Nobody%20Wanted%20to%20Touch%20%20by%20Rohit%20Kshirsagar%20%20May,%202026%20%20Medium/0oG8D4zilqU8Cn08k.jpeg)





](https://medium.com/@krohit0389?source=post_page---byline--77a7827d6b52---------------------------------------)

[Rohit Kshirsagar](https://medium.com/@krohit0389?source=post_page---byline--77a7827d6b52---------------------------------------)

Follow

6 min read

·

May 22, 2026

Listen

Share

More

847 XPath selectors. 94 test files. 4 years of accumulated fragility. Here’s how we cleared it in 12 days without introducing a single regression.

## The Selenium Suite Nobody Would Touch

Press enter or click to view image in full size

![](3%20Agents.%2012%20Days.%20Legacy%20XPath%20%E2%86%92%20Smart%20Locators%20How%20an%20LLM-Guided%20Refactor%20Modernised%20a%20Selenium%20Suite%20Nobody%20Wanted%20to%20Touch%20%20by%20Rohit%20Kshirsagar%20%20May,%202026%20%20Medium/1kGrATmPNPuoO3WwyP4ZqwA.png)

## The Selenium Suite Nobody Would Touch

Every QA team has one.

The test suite that’s been accumulating XPath debt since 2019. The one where everyone knows the selectors are fragile but the risk of touching them feels greater than the cost of living with them. The one that breaks every sprint not because the product is unstable — but because a developer renamed a CSS class on a form that has six tests pointing at it with positional XPath expressions.

Ours had 847 XPath selectors across 94 test files. The most recent file was written 18 months ago. The oldest dated to a product version that no longer existed in the same form. Some tests were testing flows that had been redesigned twice since the locators were written.

Nobody had time to fix it. Nobody wanted to start.

The 3-agent system we built didn’t just fix the locators. It solved the psychology of the problem — by making the risk of refactoring lower than the risk of leaving things as they were.

## Why XPath Debt Compounds

XPath selectors break for three reasons, and each is progressively harder to detect:

**Structural breakage** — when the DOM hierarchy changes. A positional selector like `//div[2]/form/div[1]/input` breaks the moment a developer adds a wrapper div. Immediate, obvious failure.

**Class coupling** — when CSS class names change as part of a design system migration or component refactor. `By.xpath("//div[@class='btn-primary-legacy']")` silently starts returning zero elements. Your test fails with a timeout, not a clear selector error.

**ID instability** — when auto-generated IDs regenerate between renders. Framework IDs like `ember-basic-dropdown-content-1847` change every session. The test passes locally, fails in CI, passes again on retry, and nobody can explain why.

The compounding effect: engineers learn that modifying locators is risky because they don’t know what else depends on the same element. So they don’t modify them. The debt grows. The fear grows. The suite becomes progressively more untouchable.

## Agent 1: The Archaeologist — Audit Before You Touch Anything

The first agent’s job is to remove the uncertainty about where to start.

It runs a static analysis pass across all test files, extracting every `By.*` locator call and classifying it into one of four risk tiers:

**🔴 Critical (fix immediately):** Positional XPath (`//div[3]/span[1]`), auto-generated framework IDs (`ember-*`, `ng-*`, `react-*`), dynamically injected class names. These will break without warning on the next UI change.

**🟠 High (fix this sprint):** CSS class chains with more than 2 classes, XPath with `@class` attribute matching, selectors with hardcoded index values. Likely to break on component refactors.

**🟡 Medium (schedule for next sprint):** XPath using `text()` or `contains()` against stable visible text. Fragile but intentional — text changes are usually deliberate and caught in review.

**🟢 Safe (leave alone):** `By.id()` against stable IDs, `By.name()`, `By.linkText()` against stable navigation text. Don't touch what's working.

The Archaeologist outputs a JSON remediation backlog with each locator’s file location, line number, current selector, tier classification, test criticality (critical flow vs regression coverage), and estimated fix complexity.

This backlog is the single most valuable output of the entire system. It transforms “we have 847 XPath selectors to fix” into “we have 312 Critical and High selectors to fix, here are the 47 that are in your highest-value test flows, and here’s the order to fix them in.”

## Agent 2: The Refactor Engine — Replace With Confidence Scores

The Refactor Engine takes the Critical and High tier locators from the backlog and processes them in batch.

For each locator, it runs a headless browser probe against the staging environment — navigating to the page where the element appears, capturing the full DOM subtree around the target element, and sending it to Claude Sonnet with a structured prompt:

```kotlin
Given this DOM snapshot and this failing locator:
[locator]
```

```vbnet
Agent 2: The Refactor Engine — Replace With Confidence ScoresIdentify the most stable replacement locator from this priority list:
1. By.id() — if a stable, non-generated id exists
2. By.cssSelector("[data-testid='...']") — if data-testid present
3. By.name() — for form inputs with name attributes
4. By.cssSelector("[aria-label='...']") — if aria-label is meaningful
5. By.linkText() — for navigation links with stable text
6. By.xpath() — only if no stable alternative existsReturn: recommended locator, confidence score (0–100), and rationale.
```

The confidence scoring drives the routing:

**Confidence ≥ 85%:** Auto-generated replacement. The refactored locator is applied directly, the change logged, and the test queued for Agent 3 validation.

**Confidence 60–84%:** Flagged for engineer review. The engineer sees the original locator, the recommended replacement, the confidence score, and the rationale. One-click approval or manual override.

**Confidence < 60%:** Escalated to manual. The agent provides context notes explaining why it couldn’t generate a reliable replacement — usually because the element lacks stable attributes and a `data-testid` needs to be added by the frontend team.

In our suite: 68% auto-refactored, 24% engineer-reviewed, 8% manual. The 8% that needed manual intervention were primarily auto-generated framework IDs where the element had no stable alternative — a frontend conversation, not a QA conversation.

## Agent 3: The Validator — The Safety Net That Makes Everything Else Safe

The Validator is the reason the Refactor Engine can be trusted.

After each batch of refactored tests, the Validator runs both versions — original and refactored — against the same staging environment and compares results. Any test that changes pass/fail status triggers an immediate diff report showing:

## Agent 3: The Validator — The Safety Net That Makes Everything Else Safe

-   Original locator and result
-   Refactored locator and result
-   DOM state at time of failure
-   Confidence score that was assigned

In practice: the Validator caught 4 cases in 12 days where the Refactor Engine’s high-confidence replacement was technically valid but behaviourally wrong — selecting the correct element type but on the wrong instance of a repeated component. Human review resolved each in under 10 minutes.

Zero regressions shipped. Not because the agents were perfect. Because the validation layer caught imperfection before it reached main.

## The Honest Caveats

The 8% manual intervention rate represents locators where no stable DOM attribute existed. Fixing these required the frontend team to add `data-testid` attributes to 23 components — a cross-team conversation that took 3 days to schedule and 4 hours to implement. Budget this into your timeline.

The Refactor Engine’s DOM probe requires your staging environment to be reliably available throughout the 12-day run. We had one day where environment instability caused 40+ probes to fail silently, generating false “no stable attribute found” escalations. Add an environment health check before each batch run.

The agent’s confidence scoring is calibrated against Selenium’s locator API. If your suite uses a custom element library with non-standard component rendering (Shadow DOM, Web Components), confidence scores will be systematically lower and the manual intervention rate will be higher than 8%. Assess your component architecture before estimating scope.

Finally: the Validator runs both original and refactored tests, which roughly doubles CI runtime during the 12-day window. On a suite of 94 files, this added ~35 minutes per validation run. Plan for increased CI costs during the refactor period.