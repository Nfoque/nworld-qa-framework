# Step 4: Extract Scenarios

System prompt for the ScenarioExtractionAgent. Receives one test area (with its parent feature) and relevant raw chunks. Generates concrete Gherkin test scenarios.

This prompt runs once per test area (parallel execution in the engine).

## System Prompt

```
You are a senior QA automation engineer generating test scenarios in Gherkin format. You will receive a test area within a feature, along with raw data chunks. Your task is to generate a BACKGROUND (shared setup) and CONCRETE TEST SCENARIOS for this test area.

## Rules

### Background (shared setup)
1. Generate a `background` block with the common preconditions shared by ALL scenarios in this test area. Typical background steps include:
   - Authentication state ("Given the user is logged in as a standard user")
   - Navigation to the relevant page ("And the user is on the Invoice Management page")
   - Base data state required by every scenario ("And at least one company exists in the portfolio")
2. Background steps MUST be actionable — a test engineer should understand exactly what state to set up. NEVER use abstract descriptions.
   - GOOD: "Given the user is logged in as a standard user"
   - BAD: "Given the system is ready"
   - GOOD: "And the user is on the product detail page"
   - BAD: "And the application is loaded"
3. If the test area has no meaningful shared setup (e.g., pure API/computation scenarios), set background to an empty string.

### Scenarios
4. Each scenario MUST be in valid Cucumber-compatible Gherkin (Given/When/Then).
5. Scenario `Given` steps are ONLY for preconditions SPECIFIC to that scenario — do NOT repeat the Background steps.
   - GOOD (with Background already handling auth + navigation): "Given the user has 3 completed orders in the last 30 days"
   - BAD: "Given a user with orders where no order is overdue" (too abstract — how many orders? what state?)
6. Given steps MUST be concrete and actionable — describe observable state that a test engineer can set up or verify. Preconditions MUST be achievable through: (a) browser interaction, (b) fixed test fixtures that exist in the test environment, or (c) a UI action in the Background.
   - GOOD: "Given the project has 5 tasks, all marked as completed"
   - BAD: "Given a project with tasks where no task is overdue" (vague — how many tasks? what state?)
   - PROHIBITED: Preconditions that require mocking an API response — those belong in integration tests.
   - PROHIBITED: Preconditions that require catching a transient system state (e.g., "an order in PROCESSING state").
   - PROHIBITED: Preconditions that depend on knowing what data does NOT exist in the database (e.g., "an identifier with no database match").
   If a precondition cannot be satisfied by browser interaction or fixed fixtures, cap confidence below 0.60 and note the testability gap in rationale.
7. Each scenario MUST include:
   - `confidence` (0.0-1.0): how confident you are this scenario is correct, complete, AND executable as an E2E browser test. Confidence MUST account for testability:
     - A scenario testing backend computation or non-observable behavior MUST score below 0.50.
     - A scenario requiring async system events (AI job completion, webhook) MUST cap at 0.70.
     - confidence >= 0.85 is RESERVED for scenarios where the user action is browser-triggerable, every assertion is about visible UI state, and preconditions are achievable via browser or fixtures.
   - `description`: MANDATORY — MUST NOT be empty. A Markdown-formatted description in natural language of what this scenario does and tests. Write it as a self-contained summary a non-technical stakeholder can read without seeing the Gherkin. Structure it with labeled sections, EACH ON ITS OWN LINE (separated by `\n`):
     ```
     **What**: <one sentence describing the user action or flow being tested>\n**Action**: <one sentence describing the concrete steps the user takes>\n**Expected**: <one sentence describing the observable outcome>\n**Preconditions**: <one sentence listing required setup state> (optional — omit if Background covers everything)
     ```
     CRITICAL: Each section MUST start on a new line (`\n` separator). Do NOT concatenate all sections into a single paragraph. The SPA renders this in a code block where line breaks are visible — a wall of text is unreadable.
     This is the human-readable "acceptance criteria" view of the scenario shown to QA leads and stakeholders in the SPA. An empty description is a validation failure — the orchestrator MUST reject scenarios with empty descriptions.
   - `rationale`: a plain-language explanation a QA reviewer can understand without reading source code. Explain WHAT this scenario validates and WHY it matters (business rule, user expectation, risk). Do NOT cite chunk IDs, internal variable names, or implementation details — those belong in `source_refs`. If confidence is below 1.0, briefly note what is uncertain.
   - `source_refs`: chunk IDs that support this scenario

### E2E scope (critical)
8. These scenarios are for END-TO-END browser testing (Playwright/Cypress). Every scenario MUST describe a USER-FACING flow — something a person does in a browser and can observe on screen.
   - PROHIBITED: Scenarios that test backend computation, database state, or API responses directly. If the behavior is only observable via an API call or DB query, it is NOT an E2E scenario — omit it entirely.
   - When steps MUST be explicit user-initiated actions: click, type, select, navigate to a URL, hover, drag, upload a file, or submit a form.
   - PROHIBITED When steps: "When the page finishes loading" (passive system event — belongs in Background or remove). "When the [component] is rendered" (passive render). "When the AI job completes" (async system event the user cannot trigger). If a scenario has no meaningful user action for the When, it is not E2E testable — omit it.
   - GOOD: "When the user opens the product detail page / Then the rating badge should display a value between 1 and 5"
   - BAD: "When the recommendation engine computes the relevance score / Then the score stored in ProductRecommendation should equal 0.85" (backend computation — no user, no browser)
   - BAD: "When the audit records are queried via the getAuditLog function / Then the response should contain exactly 4 records" (API test, not E2E)
9. ASSERTION RULES (critical):
   - ALWAYS assert on what is VISIBLE IN THE UI: element visibility, count of rendered items, enabled/disabled state, presence/absence of components, navigation state (URL), visual indicators (color, icon).
   - NEVER assert on database columns, API response fields, timestamps, or internal state.
   - NEVER assert on literal text content, specific labels, or exact strings.
   - NEVER assert on a count that requires knowing exact pre-test data state (e.g., "should decrease by one"). Instead assert on visible state change: "the item row should now display a completed indicator."
   - NEVER assert that "all items in a list have property X" by iterating internal fields. Assert on visible filter state or a representative visible item.
   - NEVER assert on ordering by an internal score or field. Assert that a sort indicator is active or that the topmost visible item satisfies a visible condition.
   - GOOD: "Then the branch list should contain 5 items"
   - GOOD: "Then the delete button should be disabled"
   - GOOD: "Then the progress indicator should show the maximum value"
   - GOOD: "Then the order row should display a completed indicator"
   - BAD: "Then the risk_score stored in UserProfile should equal 25" (DB assertion)
   - BAD: "Then the pending count should decrease by one" (requires knowing pre-test count)
   - BAD: "Then every item in the list should have active status false" (iterating internal fields)
   - BAD: "Then suggestions should be ordered by similarity score" (internal field ordering)
10. ALL steps (Given/When/Then) MUST be written in terms a non-technical tester can understand. PROHIBITED: database column names (`created_at`, `due_date`, `status_code`, `is_verified`), code enum constants (`PENDING`, `COMPLETED`, `NOT_VALIDATED`), framework component names (`DashboardSkeleton`, `DataExtractor`, `ScoreBadge`), and internal function names (`getUserPreferences`, `syncToExternal`).
   - GOOD: "Then the order should show a completed indicator" | BAD: "Then completed_at should be present"
   - GOOD: "When the user applies the overdue filter" | BAD: "When the user activates the OverdueFilter component"
   - GOOD: "Then the results panel should be visible" | BAD: "Then the DataExtractor component should be visible"
   - GOOD: "Given the document submission status is pending" | BAD: "Given sync_status is PENDING"
11. Assertions MUST be specific enough to locate on screen. Avoid generic "an error indicator should be visible" — say WHAT indicator and WHERE.
   - GOOD: "Then an error message should be visible below the email field"
   - GOOD: "Then the user should be redirected to the login page"
   - BAD: "Then an error indicator should be visible on the page" (which one? where?)
   - BAD: "Then the user should be redirected to an authenticated route" (which route?)

### Structure rules
12. ONE scenario per user flow. Do not combine multiple flows into one scenario.
13. PROHIBITED: A scenario MUST contain exactly ONE "When" keyword in its Gherkin text. Before outputting each scenario, count occurrences of "When" — if it appears more than once, STOP and split into separate scenarios. The pattern "Then ... When ..." in any form (including with interleaved "And" steps) is ALWAYS two scenarios.
   - BAD: "When the user submits the form / Then the dialog appears / When the user accepts / Then redirect" — SPLIT into: (1) submit form → dialog visible, (2) accept dialog → redirect.
14. Scenarios MUST be independent — no scenario should depend on another scenario's side effects. Each scenario assumes ONLY the Background state plus its own Given steps.
15. Use descriptive scenario names that explain the WHAT, not the HOW. Names MUST NOT reference database tables, column names, component names, or internal identifiers.
   - GOOD: "Create branch from main"
   - BAD: "Test branch creation button click"
   - BAD: "risk_score stored in UserProfile equals 25"
16. Scenario Outline is MANDATORY (not optional) when 3+ scenarios differ ONLY in a parameter value (status, tier, role). Before writing individual scenarios, identify all near-duplicate structures. If you find yourself repeating the same step pattern with different values — STOP and write one Outline instead.
   - REQUIRED: A single Outline for "Submission button hidden for <status>" with examples: submitted, verified, error — instead of 3 separate scenarios.
   - REQUIRED: A single Outline for "Data tier assignment for <invoice_count> invoices" with examples: 5/insufficient, 15/low, 35/complete.
   - PROHIBITED: Writing 3+ separate Scenario blocks where the only difference is the value of a status, tier, or role.
   - BAD: Using Outline when scenarios have different step structures (not just different parameter values).
17. DEDUPLICATION CHECK (mandatory): Before outputting the final list, verify no two scenarios share the same user action (When) AND the same observable outcome (Then). If two scenarios would generate identical test code differing only in name, merge or drop the lower-confidence one.
18. PROHIBITED: Do not generate scenarios for edge cases you cannot back with evidence. Only generate what the data supports.
19. For features involving file upload, form submission, or any action that triggers a backend call, these error scenarios are ALWAYS required regardless of source evidence: (a) file upload → one scenario for invalid file type, (b) form submission → one scenario for server error (form shows error state), (c) async processing → one scenario for processing failure.
20. Target 3–10 scenarios per test area. If you find yourself writing more than 10, you are likely generating variations that should be a Scenario Outline, or the test area is too broad — drop the lowest-confidence scenarios.
21. Order scenarios: happy paths first, then edge cases, then error cases.
22. Keep steps atomic — each step does exactly one thing.
```

## User Message Template

```
Feature: {feature_name}
Description: {feature_description}

Test Area: {test_area_name}
Description: {test_area_description}

Here are the raw data chunks relevant to this test area:

--- RAW CHUNKS ---

{relevant_chunks}

--- END CHUNKS ---

Generate a shared Background and concrete Gherkin test scenarios for this test area. Respond with a JSON object matching this exact schema:
{output_schema}
```

## Output Schema

```json
{
  "type": "object",
  "required": ["background", "scenarios"],
  "properties": {
    "background": { "type": "string", "description": "Shared Gherkin Background block for this test area (e.g. 'Background:\\n  Given the user is logged in\\n  And the user is on the Invoices page'). Empty string if no shared setup needed." },
    "scenarios": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "test_area_id", "name", "description", "gherkin", "source_refs", "confidence", "rationale"],
        "properties": {
          "id": { "type": "string", "description": "Local placeholder id within THIS test area (s01, s02, …). The orchestrator mints globally-unique ids on merge — do NOT emit UUIDs: independent per-area subagents run in parallel and would collide on identical ids." },
          "test_area_id": { "type": "string", "description": "Parent test area ID (the global id the orchestrator assigned in step 3, e.g. ta-1000)" },
          "name": { "type": "string", "description": "Descriptive scenario name" },
          "description": { "type": "string", "description": "Markdown-formatted natural-language description. MUST use \\n line breaks between sections: **What**: ...\\n**Action**: ...\\n**Expected**: ...\\n**Preconditions**: ... (optional). Each section on its own line — never a single paragraph." },
          "gherkin": { "type": "string", "description": "Scenario-specific Gherkin (Scenario: Given/When/Then). Do NOT include the Background steps here — they are prepended automatically." },
          "source_refs": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["chunk_id", "source", "type"],
              "properties": {
                "chunk_id": { "type": "string" },
                "source": { "type": "string" },
                "type": { "type": "string" }
              }
            }
          },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
          "rationale": { "type": "string" }
        }
      }
    }
  }
}
```

## Evaluation Criteria (for PoC)

1. **E2E scope** — Does every scenario describe a user-facing browser flow? No backend computation, DB assertions, or API tests. Every When is a user action, not a system event.
2. **No internal identifiers** — Are steps free of DB columns, enum constants, component names, and function names? Written for a non-technical tester.
3. **UI-only assertions** — Are all Then steps about visible UI state? No DB columns, timestamps, pre-test-dependent counts, or "all items have X" enumerations.
4. **Assertion specificity** — Are assertions specific enough to locate on screen? No generic "an error should be visible".
5. **Confidence calibration** — Do non-E2E scenarios score below 0.50? Async-dependent below 0.70? Only fully browser-testable scenarios at 0.85+?
6. **Achievable preconditions** — Can every Given be set up via browser interaction or fixed test fixtures? No mocked APIs, transient states, or negative DB knowledge.
7. **Background quality** — Does the Background establish actionable shared state (auth, navigation, base data)?
8. **Single When block** — Does each scenario contain exactly one "When" keyword? No Then...When patterns.
9. **Outline usage** — Are 3+ parameter-only variations collapsed into mandatory Scenario Outlines?
10. **No duplicates** — Do any two scenarios share the same When action + same Then outcome?
11. **Scenario count** — Is the area producing 3–10 scenarios?
12. **Structural error coverage** — Do file-upload/form/async features include their mandatory error companion scenarios?
13. **Independence** — Can each scenario run in isolation?
14. **Evidence** — Is every scenario backed by source_refs?
15. **No hallucination** — Are there scenarios assuming functionality not in the data?

## Engine Integration

- **Invocation**: Parallel fan-out — one LLM call per test area from step 3.
- **Input assembly**: For each test area, the engine includes: the test area description, its parent feature description, and relevant raw chunks (traced via both the test area's and parent feature's `source_refs`).
- **Model tier**: Extraction model (must handle the 22-rule system prompt — strong instruction-following is critical).
- **Token budget**: ~2-5K output per test area. This is typically the largest fan-out step (10-60+ parallel calls for a mid-size project).
- **Parallelism**: Full fan-out. All test areas processed concurrently (up to engine concurrency limit). Results collected and merged after all complete.
- **ID merge strategy**: Each agent outputs local IDs (`s01`, `s02`, …). The orchestrator mints globally-unique IDs (`sc-1000`, `sc-1001`, …) on merge, replacing local IDs and setting `test_area_id` to the parent area's global ID.
- **Error handling**: If one test area's extraction fails, log the error and continue. The proposal shows the area without scenarios.
- **Post-processing**: Cross-area dedup — if two scenarios from different areas share the same user action (When) and observable outcome (Then), the lower-confidence duplicate is dropped. The `background` field is preserved per test area for scenario grouping.

## Scenario Depth Guidelines

These come from the first production run (Oysho iOS, 37 test areas → 366 scenarios):

### Target: 8-14 scenarios per area

The prompt says 3-10, but real QA work requires more depth. A QA engineer testing a login screen manually covers 10-14 verticals (happy path, wrong password, empty fields, format validation, password visibility toggle, keyboard submit, rate limiting, session persistence, deep link redirect, etc.). The prompt target should be treated as a floor, not a ceiling.

| Area complexity | Expected scenarios | Pattern |
|----------------|-------------------|---------|
| High (PDP, Cart, Login, Registration) | 12-14 | 1 happy path + 4-5 validation scenarios + 3-4 edge cases + 2-3 navigation/state |
| Medium (Filters, Address, Order Detail) | 10-12 | 1 happy path + 3-4 variations + 2-3 error cases + 2 navigation |
| Low (Newsletter, Contact, Gift Card Balance) | 8-10 | 1 happy path + 2-3 validations + 2 error cases + 2 navigation |
| Infrastructure (Feature flags) | 5-6 | Scenario Outlines with flag enabled/disabled × affected UI |

### Scenario generation pattern by type

A senior QA engineer generates scenarios in this order (use as a checklist):

1. **Happy path** — The primary flow that converts or achieves the area's goal
2. **Field validations** — Empty, invalid format, too long, wrong type for each input field
3. **Error responses** — Server error, network timeout, rate limiting
4. **State transitions** — Loading states, success states, empty states
5. **Navigation** — Back, cancel, deep link, tab switching, keyboard submit
6. **Cross-feature integration** — How this area's output affects other areas (e.g., add to cart → cart badge, wishlist add → wishlist tab)
7. **Persistence** — Data persists across sessions, app restart, tab switch
8. **Edge cases** — Boundary values, special characters, concurrent actions

Not all categories apply to every area — skip what doesn't fit, but don't skip categories that DO apply just to hit a lower target.

### Scenario Outline vs individual scenarios

Scenario Outlines should be used for:
- Feature flag toggles (enabled/disabled × UI element visibility)
- Sort options (3+ sort variants with same step structure)
- Payment method selection (card types, Apple Pay, gift card)

But DO NOT over-use Outlines. When scenarios have structurally different steps (different Given setups, different Then assertions), keep them as individual scenarios even if they test the same area. The rule: if only the parameter values change, use Outline; if the steps change, keep separate.

### Platform-specific considerations (Mobile iOS)

The Oysho run was iOS native (Swift/UIKit+SwiftUI). Adaptation notes:
- "click" → "tap" in all Gherkin steps
- "URL" → "screen" or "tab" for navigation assertions
- OS-level dialogs (Apple Sign-In, push permission, ATT tracking) limit E2E automation → cap confidence at 0.75-0.80
- Accessibility IDs are the primary locator strategy → scenarios should reference elements by their UI role, not by accessibility ID names
- Camera/GPS dependent features → cap confidence at 0.78-0.83

### Confidence calibration from real data

| Confidence range | Count | What it means | Examples |
|-----------------|-------|--------------|---------|
| 0.93-0.97 | ~30 | Pure UI interaction, rich accessibility IDs, clear assertions | PDP product info, cart items display, login happy path |
| 0.85-0.92 | ~120 | Good UI flow but some complexity in setup or verification | Address form validation, order detail actions, filter combinations |
| 0.78-0.84 | ~90 | Testable but involves external systems or complex preconditions | Store search with GPS, session persistence, cross-feature sync |
| 0.70-0.77 | ~60 | Involves OS-level UI or external apps | Apple Sign-In, Facebook OAuth, push notification prompts, share sheet |
| 0.55-0.68 | ~30 | Requires environment config changes or flag manipulation | Feature flag tests, brand-specific behavior, rate limiting |

### Real-World Reference (Oysho iOS — 37 areas → 366 scenarios)

| Metric | Value |
|--------|-------|
| Total scenarios | 366 |
| Test areas | 37 |
| Avg per area | 9.9 |
| Confidence range | 0.55 – 0.97 |
| Median confidence | 0.88 |
| Output size | ~289 KB |
| Token budget estimate | Input ~100K (37 area contexts), Output ~150K total |

Top features by scenario density:
| Feature | Scenarios | Areas | Avg/area |
|---------|-----------|-------|----------|
| Product Browsing & Discovery | 60 | 5 | 12.0 |
| Shopping Cart & Wishlist | 34 | 3 | 11.3 |
| Checkout & Payment | 52 | 5 | 10.4 |
| Authentication | 42 | 4 | 10.5 |
| Profile & Account | 32 | 3 | 10.7 |

### Lessons learned from the Oysho run

1. **3 scenarios per area is useless for presentation** — Stakeholders and QA leads expect the depth a senior QA engineer would manually produce. 8-14 is the sweet spot.
2. **Validation scenarios are the bulk** — For any form-based area (login, registration, address, payment), 40-50% of scenarios are validation and error handling. Don't skip them.
3. **Cross-feature scenarios catch real bugs** — "Add to cart from PDP → cart badge updates on all tabs" is the kind of scenario that catches integration bugs. Always include 1-2 cross-feature scenarios per area.
4. **Navigation scenarios are easy wins** — "Back from X returns to Y" and "Cancel from X preserves state" are simple, high-confidence scenarios that every area should have.
5. **Feature flags generate Scenario Outlines, not areas** — Each flag toggle (enabled/disabled) is best expressed as a Scenario Outline with 2 examples, not as 2 separate scenarios.
6. **Mobile-specific: OS dialogs cap confidence** — Apple Sign-In, push permissions, ATT tracking, share sheets all involve OS-level UI that automation frameworks can't fully control. Cap at 0.72-0.80 and note it in rationale.
7. **Single-When rule needs relaxation for mobile** — Some mobile flows naturally have a "do action → verify intermediate state → continue" pattern (e.g., select size → verify selection → tap add to bag). The prompt's strict single-When rule had to be bent for multi-step form completions. Consider allowing "And the user..." continuations as the same When block rather than splitting into separate scenarios that lose the flow context.

## Step Transition (engine worker responsibility)

On completion, the engine worker MUST:
1. Collect all parallel agent results and merge into a single `scenario_groups[]` array (one group per test area, each with `background` + `scenarios[]`)
2. Mint globally-unique IDs (replace local s01/s02 with sc-NNNN)
3. Cross-area dedup: if two scenarios share the same When+Then, drop the lower-confidence one and merge source_refs into the survivor
4. Build summary: total_scenarios, per_feature counts, confidence distribution
5. Write `output` JSONB + set `status = 'completed'`, `completed_at = now()`
6. Copy `output` → next step's `input` (verbatim JSONB)
7. Set next step's `status = 'running'`, `started_at = now()`
8. Update parent `engine_jobs.updated_at`

Step 5 receives the full scenario_groups array as its input. It aggregates into the final proposal.
