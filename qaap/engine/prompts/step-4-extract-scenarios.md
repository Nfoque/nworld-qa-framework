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
   - Navigation to the relevant screen ("And the user is on the Invoice Management page" / mobile: "And the user is on the Profile tab")
   - Base data state required by every scenario ("And at least one company exists in the portfolio" / mobile: "And the user has at least one item in the shopping bag")
   - Platform state (mobile only, if applicable): "And the user has granted push notification permission" / "And Store Mode is enabled"
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
8. These scenarios are for END-TO-END UI testing. The execution framework depends on the project type: web (Playwright/Cypress), mobile iOS (XCUITest/Appium), mobile Android (Espresso/Appium). Every scenario MUST describe a USER-FACING flow — something a person does in the app and can observe on screen.
   - PROHIBITED: Scenarios that test backend computation, database state, or API responses directly. If the behavior is only observable via an API call or DB query, it is NOT an E2E scenario — omit it entirely.
   - When steps MUST be explicit user-initiated actions. Web: click, type, select, navigate to a URL, hover, drag, upload a file, submit a form. Mobile: tap, type, select, swipe, scroll, navigate to a screen, long-press. Use platform-appropriate verbs based on the project type.
   - PROHIBITED When steps: "When the page finishes loading" (passive system event — belongs in Background or remove). "When the [component] is rendered" (passive render). "When the AI job completes" (async system event the user cannot trigger). If a scenario has no meaningful user action for the When, it is not E2E testable — omit it.
   - GOOD: "When the user opens the product detail page / Then the rating badge should display a value between 1 and 5"
   - BAD: "When the recommendation engine computes the relevance score / Then the score stored in ProductRecommendation should equal 0.85" (backend computation — no user, no UI)
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
13. A scenario MUST contain exactly ONE "When" keyword in its Gherkin text. Before outputting each scenario, count occurrences of "When" — if it appears more than once, STOP and split into separate scenarios. The pattern "Then ... When ..." in any form (including with interleaved "And" steps) is ALWAYS two scenarios.
   - BAD: "When the user submits the form / Then the dialog appears / When the user accepts / Then redirect" — SPLIT into: (1) submit form → dialog visible, (2) accept dialog → redirect.
   - EXCEPTION (mobile multi-step forms): When a mobile flow naturally chains "do action → verify intermediate state → continue" (e.g., select size → picker appears → tap size → picker closes → tap add to bag), the continuation steps after the primary When can use "And the user..." within the same When block. This avoids splitting tightly coupled mobile interactions into artificial fragments. Only apply this exception when the intermediate step has no independent test value.
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
18b. JIRA BUG REGRESSION: If the raw chunks contain Jira bug reports (identified by "Bug" type, "Done" or "In Progress" status), generate an explicit regression test scenario for each bug. Name it clearly (e.g., "Regression: cart total not updating after promo code removal"). These are high-value scenarios — known bugs have a higher re-occurrence rate than hypothetical edge cases. Cap confidence based on testability (the bug's fix may be verified through UI observation or may require backend state).
19. For features involving file upload, form submission, or any action that triggers a backend call, these error scenarios are ALWAYS required regardless of source evidence: (a) file upload → one scenario for invalid file type, (b) form submission → one scenario for server error (form shows error state), (c) async processing → one scenario for processing failure.
20. Target **8–14 scenarios per test area** (see Scenario Depth Guidelines). Scale depth with the parent test area's confidence:
   - Area confidence ≥ 0.85 → 10-14 scenarios (full depth: happy path + validations + errors + navigation + cross-feature + edge cases)
   - Area confidence 0.70–0.84 → 8-12 scenarios (happy path + validations + errors + navigation)
   - Area confidence < 0.70 → 5-8 scenarios (happy path + key validations + errors only — thin evidence doesn't justify speculative edge cases)
   If more than 14, you are generating variations that should be a Scenario Outline, or the test area is too broad — drop the lowest-confidence scenarios.

20b. SCENARIO VALUE CLASSIFICATION AND FILTERING (new rule):
   After generating all candidate scenarios, classify EACH by value tier:
   
   **TIER 1 (HIGH VALUE)** — Keep unconditionally:
   - Primary user goal / happy path
   - Business rule enforcement (validation, matching, conditional logic)
   - Error handling (server error, validation error, network error)
   - Data persistence (across sessions, app restart)
   - Jira bug regression (from bug reports)
   
   **TIER 2 (MEDIUM VALUE)** — Keep if <10 high-value scenarios already:
   - State transitions (loading → loaded, empty → populated)
   - Cross-feature side effects (cart count updates when item added)
   - Navigation between related screens
   - Permission/gate testing (feature flag, role-based)
   
   **TIER 3 (LOW VALUE)** — EXCLUDE if >10 total scenarios:
   - Element visibility WITHOUT user interaction ("button is visible")
   - Generic back/cancel button ("back navigates correctly")
   - Layout stability ("layout stable after backgrounding")
   - Rotation/orientation testing
   - Passive state checks ("text appears on screen")
   
   **Implementation:**
   1. Tag each scenario with `"value_tier": "TIER-1" | "TIER-2" | "TIER-3"`
   2. Count TIER-1 and TIER-2 scenarios
   3. If total > 10, drop ALL TIER-3 scenarios
   4. If total > 14, drop lowest-confidence TIER-2 until 10-14 remain
   5. Output `dropped_scenarios_summary`:
      ```json
      {
        "total_generated": 51,
        "total_kept": 12,
        "dropped_tier_3": 31,
        "tier_distribution": {
          "tier_1": 9,
          "tier_2": 3,
          "tier_3_dropped": 31
        },
        "reason": "Tier-3 shell scenarios reduced from 31 to 0 (total 51 > threshold 10)"
      }
      ```

21. Order scenarios: happy paths first, then validations, then error cases, then navigation, then edge cases.
22. Keep steps atomic — each step does exactly one thing.
23. SCENARIO DEPTH CHECKLIST (mandatory — generate in this order, skip categories that don't apply):
   1. **Happy path** — The primary flow that achieves the area's goal
   
   2. **VALIDATION AND BUSINESS RULES** (PRIORITIZED — generate first after happy path):
      For EACH business rule extracted in Step 3 (from Jira test steps, acceptance criteria, documentation),
      generate AT LEAST ONE scenario demonstrating the rule:
      
      Common rule patterns (check for these in EVERY test area):
      - Field matching: "password must match confirmation", "email must match confirm email"
      - Boundary values: "amount 20-500", "text 4-20 characters", "date not in past"
      - Format validation: "phone must include country prefix", "postal code matches region", "email format valid"
      - Conditional state: "if user is passwordless, show info panel", "if company account, show tax ID", "if instant delivery, hide date picker"
      - Mandatory fields/checkboxes: "privacy policy must be accepted", "terms must be checked"
      - Server validation: "username already exists", "email in use", "invalid credentials"
      
      For EACH business rule, generate 2 scenarios:
        a) Happy path: rule is satisfied → form submits/proceeds
        b) Failure path: rule is violated → error shown, form blocked
      
      For FORM-BASED test areas (login, registration, address, payment, gift card), 40-50% of scenarios MUST be validation/rule scenarios.
      For UI-BASED test areas, 20-30% MUST be validation/rule scenarios.
   
   3. **Error responses** — Server error, network timeout, form submission failure
   4. **State transitions** — Loading states, success states, empty states
   5. **Navigation** — Back, cancel, deep link, tab switching
   6. **Cross-feature integration** — How this area's output affects other areas (e.g., add to cart → cart badge count updates)
   7. **Persistence** — Data persists across sessions, app restart, tab switch
   8. **Edge cases** — Boundary values, special characters, concurrent actions
   
   Not all categories apply to every area, but don't skip categories that DO apply just to hit a lower target.
```

## User Message Template

```
Feature: {feature_name}
Description: {feature_description}

Test Area: {test_area_name}
Description: {test_area_description}

Business Rules (extracted from test documentation):
{business_rules}

Precondition Variants (if applicable):
{precondition_variants}

IMPORTANT: If precondition_variants exist, generate SEPARATE scenario sets for EACH variant. 
Do NOT generate one-size-fits-all scenarios. Each variant has different UI states, enabled/disabled 
buttons, info panels, and flows.

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
          "value_tier": { "type": "string", "enum": ["TIER-1", "TIER-2", "TIER-3"], "description": "Value classification: TIER-1 (high value, keep), TIER-2 (medium, conditional), TIER-3 (low, exclude if >10 total)" },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
          "rationale": { "type": "string" }
        }
      }
    },
    "dropped_scenarios_summary": {
      "type": "object",
      "description": "Summary of scenarios dropped during value filtering (new in Rule 20b)",
      "properties": {
        "total_generated": { "type": "integer", "description": "Total scenarios generated before filtering" },
        "total_kept": { "type": "integer", "description": "Total scenarios after filtering" },
        "dropped_tier_3": { "type": "integer", "description": "Count of Tier-3 scenarios dropped" },
        "tier_distribution": {
          "type": "object",
          "properties": {
            "tier_1": { "type": "integer" },
            "tier_2": { "type": "integer" },
            "tier_3_dropped": { "type": "integer" }
          }
        },
        "reason": { "type": "string", "description": "Why filtering was applied (e.g., 'Tier-3 shell scenarios reduced from 31 to 0')" }
      }
    }
  }
}
```

## Evaluation Criteria

1. **E2E scope** — Does every scenario describe a user-facing UI flow? No backend computation, DB assertions, or API tests. Every When is a user action, not a system event.
2. **No internal identifiers** — Are steps free of DB columns, enum constants, component names, and function names? Written for a non-technical tester.
3. **UI-only assertions** — Are all Then steps about visible UI state? No DB columns, timestamps, pre-test-dependent counts, or "all items have X" enumerations.
4. **Assertion specificity** — Are assertions specific enough to locate on screen? No generic "an error should be visible".
5. **Confidence calibration** — Do non-E2E scenarios score below 0.50? Async-dependent below 0.70? Only fully UI-testable scenarios at 0.85+? OS-level dialogs (mobile) at 0.75-0.80? Camera/GPS at 0.78-0.83?
6. **Achievable preconditions** — Can every Given be set up via app interaction or fixed test fixtures? No mocked APIs, transient states, or negative DB knowledge.
7. **Background quality** — Does the Background establish actionable shared state (auth, navigation, base data, platform permissions)?
8. **Single When block** — Does each scenario contain exactly one "When" keyword? No Then...When patterns (except the mobile multi-step form exception)?
9. **Outline usage** — Are 3+ parameter-only variations collapsed into mandatory Scenario Outlines?
10. **No duplicates** — Do any two scenarios share the same When action + same Then outcome?
11. **Scenario depth** — Is the area producing 8-14 scenarios (or 5-8 for areas with confidence < 0.70)? Does the count match the confidence-gated scale in Rule 20?
12. **Structural error coverage** — Do file-upload/form/async features include their mandatory error companion scenarios?
13. **Independence** — Can each scenario run in isolation?
14. **Evidence** — Is every scenario backed by source_refs?
15. **No hallucination** — Are there scenarios assuming functionality not in the data?
16. **Depth checklist coverage** — Does the area cover all applicable categories from the Rule 23 checklist (happy path, validations, errors, navigation, cross-feature, persistence)?
17. **Jira bug regression** — If Jira chunks contain bug reports (issues with Bug type, status Done or In Progress), are there corresponding regression test scenarios? Known bugs are high-value scenario sources.
18. **Platform-appropriate vocabulary** — Are steps using the correct verbs for the project type (tap/swipe for mobile, click/hover for web)?

## Engine Integration

- **Invocation**: Parallel fan-out — one LLM call per test area from step 3 (10-100+ agents depending on project scale). For large projects (50+ areas), use **feature-grouped execution**: one agent per feature, each processing its 3-6 test areas sequentially. This reduces orchestration overhead from N agents to N/5 agents while maintaining the same effective parallelism (since areas within a feature share chunks and the feature-level agent caches them in context).
- **Input assembly**: For each test area, the engine MUST union source_refs from BOTH the test area AND its parent feature, then filter raw chunks by the combined set. This ensures scenarios have full context — the area's specific evidence plus the broader feature context. In multi-source runs, the union naturally includes chunks from different source types (e.g., code chunks + Jira chunks), giving the scenario agent richer context than any single source alone. Write per-area input files as `{feature, test_area, chunks}` JSON for auditability.
- **Shared rules file**: The system prompt (23 rules + depth checklist) should be written to a shared file that all agents read, rather than embedded in each prompt. At 84 areas, this saves ~400K tokens of duplicated system prompt across all calls.
- **Model tier**: Extraction model (must handle the 23-rule system prompt — strong instruction-following is critical).
- **Token budget**: ~3-7K output per test area (increased from 2-5K to account for the 8-14 target). Reference: 84 areas → estimated ~250K input, ~400K output total.
- **Parallelism**: Feature-grouped fan-out preferred. Example: 16 agents for 84 areas vs 84 individual agents. The engine concurrency limit (typically 10-16) naturally matches the feature count for most projects.
- **ID merge strategy**: Each agent outputs local IDs (`s01`, `s02`, …). The orchestrator mints globally-unique IDs (`sc-1000`, `sc-1001`, …) on merge, replacing local IDs and setting `test_area_id` to the parent area's global ID.
- **Error handling**: If one test area's extraction fails, log the error and continue. The proposal shows the area without scenarios.
- **Post-processing**: Cross-area dedup — if two scenarios from different areas share the same user action (When) and observable outcome (Then), the lower-confidence duplicate is dropped and its `source_refs` merged into the survivor. The `background` field is preserved per test area for scenario grouping. At 84 areas, expect 2-5% duplicate rate (vs ~1% at 37 areas) due to increased overlap surface between related features.

## Scenario Depth Guidelines

Calibration data from production runs. Use to set expectations, not as hard limits:

### Target: 8-14 scenarios per area

Rule 20 says 8-14 (production runs proved 3-10 was insufficient). A QA engineer testing a login screen manually covers 10-14 verticals (happy path, wrong password, empty fields, format validation, password visibility toggle, keyboard submit, rate limiting, session persistence, deep link redirect, etc.). The scenario depth checklist (Rule 23) enforces this by requiring explicit category coverage.

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

### Platform-specific considerations

Adapt Gherkin language and confidence calibration to the project's platform. The engine detects `project.type` from Step 1 metadata and should apply:

**Mobile (iOS / Android):**
- "click" → "tap" in all Gherkin steps
- "URL" → "screen" or "tab" for navigation assertions
- OS-level dialogs (Apple Sign-In, Google Sign-In, push permissions, tracking permissions) limit E2E automation → cap confidence at 0.75-0.80
- Accessibility IDs are the primary locator strategy → scenarios should reference elements by their UI role, not by accessibility ID names
- Camera/GPS dependent features → cap confidence at 0.78-0.83
- App lifecycle events (background/foreground, kill/restart) are valid When actions for persistence scenarios

**Web SPA:**
- Use standard web verbs: click, type, select, hover, drag, upload, navigate to URL
- URL-based navigation assertions are valid (route changes, query params)
- Browser-level events (resize, offline/online) are valid When actions
- Tab/window management scenarios are valid but cap confidence at 0.80 (browser-dependent behavior)

**Desktop:**
- Adapt to the framework's verb set (click, type, keyboard shortcuts)
- OS-level dialogs (file picker, print dialog) limit automation → cap confidence at 0.75-0.80
- Multi-window management scenarios cap at 0.78

### Confidence calibration from real data

| Confidence range | Count | What it means | Examples |
|-----------------|-------|--------------|---------|
| 0.93-0.97 | ~30 | Pure UI interaction, rich accessibility IDs, clear assertions | PDP product info, cart items display, login happy path |
| 0.85-0.92 | ~120 | Good UI flow but some complexity in setup or verification | Address form validation, order detail actions, filter combinations |
| 0.78-0.84 | ~90 | Testable but involves external systems or complex preconditions | Store search with GPS, session persistence, cross-feature sync |
| 0.70-0.77 | ~60 | Involves OS-level UI or external apps | Apple Sign-In, Facebook OAuth, push notification prompts, share sheet |
| 0.55-0.68 | ~30 | Requires environment config changes or flag manipulation | Feature flag tests, brand-specific behavior, rate limiting |

### Production Calibration — Run #1 (Large Mobile E-commerce App — 37 areas → 366 scenarios)

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

### Lessons learned from production runs

1. **3 scenarios per area is useless for presentation** — Stakeholders and QA leads expect the depth a senior QA engineer would manually produce. 8-14 is the sweet spot.
2. **Validation scenarios are the bulk** — For any form-based area (login, registration, address, payment), 40-50% of scenarios are validation and error handling. Don't skip them.
3. **Cross-feature scenarios catch real bugs** — "Add to cart from PDP → cart badge updates on all tabs" is the kind of scenario that catches integration bugs. Always include 1-2 cross-feature scenarios per area.
4. **Navigation scenarios are easy wins** — "Back from X returns to Y" and "Cancel from X preserves state" are simple, high-confidence scenarios that every area should have.
5. **Feature flags generate Scenario Outlines, not areas** — Each flag toggle (enabled/disabled) is best expressed as a Scenario Outline with 2 examples, not as 2 separate scenarios.
6. **Mobile-specific: OS dialogs cap confidence** — Apple Sign-In, push permissions, ATT tracking, share sheets all involve OS-level UI that automation frameworks can't fully control. Cap at 0.72-0.80 and note it in rationale.
7. **Single-When rule needs relaxation for multi-step forms** — Some flows (especially mobile) naturally have a "do action → verify intermediate state → continue" pattern (e.g., select option → verify selection → tap confirm). The strict single-When rule should be bent for tightly coupled multi-step interactions. Allow "And the user..." continuations within the same When block rather than splitting into separate scenarios that lose the flow context. This exception applies when the intermediate step has no independent test value.

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

## Production Calibration — Run #2 (Same App, Multi-Source — 84 test areas, 16 features)

Second production run with code + Jira sources (39 chunks → 16 features → 84 test areas). Compared to Run #1 (37 areas → 366 scenarios), this run has 2.3× more areas due to Jira-enriched feature extraction producing more granular splits.

### Orchestration strategy

**Feature-grouped execution** (16 agents, not 84):
- Each agent handles all test areas for one feature (3-6 areas each)
- Agent reads a shared rules file from disk instead of embedding the full system prompt in each call
- Per-area input files written to disk: `step4-input-{area_id}.json` with `{feature, test_area, chunks}`
- Per-area output files: `step4-output-{area_id}.json`
- Reduces agent count from 84 to 16, saving orchestration overhead and enabling better feature-level context

**Input assembly refinement**:
- Source_refs are unioned from BOTH the test area AND the parent feature before filtering chunks
- This ensures areas with thin direct evidence still get the broader feature context
- Example: ta-1032 "Recently Viewed Products" has only 1 source_ref (jira-004), but its parent f-006 has 9 source_refs — the union gives the agent full browsing context

### Final results (16/16 features)

| Feature | Areas | Scenarios | Avg/area | Confidence range |
|---------|-------|-----------|----------|-----------------|
| f-001 Authentication | 5 | 55 | 11.0 | 0.73–0.93 |
| f-002 Product Detail Page | 6 | 66 | 11.0 | 0.84–0.93 |
| f-003 Shopping Cart | 6 | 60 | 10.0 | 0.78–0.95 |
| f-004 Checkout | 5 | 59 | 11.8 | 0.76–0.91 |
| f-005 Product Search | 5 | 54 | 10.8 | 0.76–0.93 |
| f-006 Browsing & Catalogue | 5 | 56 | 11.2 | 0.58–0.92 |
| f-007 Wishlist | 6 | 60 | 10.0 | 0.72–0.92 |
| f-008 Profile & Account | 4 | 42 | 10.5 | 0.65–0.92 |
| f-009 Order Management | 6 | 64 | 10.7 | 0.68–0.92 |
| f-010 Returns & Refunds | 6 | 63 | 10.5 | 0.65–0.91 |
| f-011 Stores & C&C | 5 | 58 | 11.6 | 0.78–0.91 |
| f-012 Gift Cards | 5 | 54 | 10.8 | 0.70–0.90 |
| f-013 Digital Wallet | 6 | 61 | 10.2 | 0.60–0.87 |
| f-014 Push & Deep Links | 5 | 60 | 12.0 | 0.65–0.87 |
| f-015 Store Mode | 5 | 51 | 10.2 | 0.60–0.87 |
| f-016 Help & Contact | 4 | 43 | 10.8 | 0.70–0.92 |
| **TOTAL** | **84** | **906** | **10.8** | **0.58–0.95** |

### Confidence distribution

| Band | Count | % |
|------|-------|---|
| High (≥0.85) | 511 | 56.4% |
| Medium (0.70–0.84) | 358 | 39.5% |
| Low (<0.70) | 37 | 4.1% |

Cross-area duplicates removed: 0 (prompts were specific enough that no two areas produced identical When+Then pairs).

### Lessons learned

1. **Confidence-gated scenario count works.** ta-1042 (App Settings, area confidence 0.78) correctly produced 8 scenarios, while ta-1039 (Personal Data, area confidence 0.93) produced 14. Rule 20's scaling formula (≥0.85 → 10-14, 0.70-0.84 → 8-12, <0.70 → 5-8) aligns with natural depth — thin evidence shouldn't spawn speculative scenarios.

2. **Feature-grouped agents maintain context across areas.** An agent processing f-008's 4 areas (Personal Data, Address Book, Newsletter, Settings) has the full Profile feature context when generating each area. This helps avoid cross-area scenario duplication within the same feature and produces more coherent backgrounds.

3. **Shared rules file saves ~400K tokens.** The system prompt is ~5K chars. At 84 areas with individual agents, that's 420K chars of duplicated rules. A shared file reduces this to one read per agent (16 reads total).

4. **Per-area input/output files create an audit trail.** Each area's input and output are independently verifiable. Failed areas can be re-run without re-processing siblings. The merge step (ID minting + dedup) runs as a separate post-processing script.

5. **Jira-enriched areas produce more specific scenarios.** Areas backed by Jira stories/bugs generate scenarios that directly test known issues (e.g., a bug like "total doesn't update when removing promo code" becomes a regression test scenario). Single-source runs miss these because the bug signals aren't in the code chunks.

6. **Rule 13 relaxation for mobile was needed.** iOS flows like "tap size picker → select size → picker closes → tap add to bag" are one logical When block. The Run #1 strict single-When interpretation would have split this into 3 scenarios that lose the flow context. The exception clause prevents this while still catching genuine multi-flow violations.

7. **Platform-agnostic rule 8 was overdue.** The original "browser testing (Playwright/Cypress)" framing caused agents to use web-centric vocabulary ("click", "URL", "page"). Updating to "UI testing" with platform-specific verb guidance eliminated this in Run #2.
