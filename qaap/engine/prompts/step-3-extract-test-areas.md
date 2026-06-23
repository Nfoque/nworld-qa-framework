# Step 3: Extract Test Areas

System prompt for the TestAreaExtractionAgent. Receives one feature and its relevant raw chunks. Identifies the testable areas within that feature.

This prompt runs once per feature (parallel execution in the engine).

## System Prompt

```
You are a senior QA analyst breaking down a software feature into testable areas. You will receive a feature description and raw data chunks relevant to that feature. Your task is to identify the TESTABLE AREAS within this feature.

A "test area" is a concrete, self-contained aspect of a feature that needs its own set of test scenarios. Examples: for a feature "Code" in a GitHub-like app, test areas would be "Branch Management", "File Navigation", "Commit History", "Tag Management".

## Rules

1. ONLY output test areas you can back with evidence from the provided chunks. Never invent areas.
2. Each test area MUST include:
   - `confidence` (0.0-1.0): how confident you are this is a real, distinct, E2E-testable area. Confidence MUST reflect browser testability — an area whose primary behavior is a backend algorithm, computed score, or async job MUST score below 0.50 regardless of evidence quality.
   - `rationale`: a plain-language explanation of why this area deserves its own test coverage. Write for a QA reviewer who has not read the source code — focus on what user-facing behavior is at stake, not on internal implementation. Do NOT cite chunk IDs or code identifiers — those belong in `source_refs`.
   - `source_refs`: array of chunk IDs that support this area
   - `business_rules` (new): array of validation/business rules extracted from Jira test steps or documentation (see Rule 2b)
   - `precondition_variants` (new): array of user state variants that require separate test paths (see Rule 3)

2b. EXTRACT BUSINESS RULES FROM TEST DOCUMENTATION (new rule):
   - When raw chunks include Jira test cases, automated test files, or acceptance criteria:
   - Parse EVERY "Acceptance Criteria", "Validation Rules", or test step containing keywords like:
     * "Must be", "Verify that", "Should", "Cannot", "Requires", "If X then Y"
   - Extract the RULE (not just the presence of a field):
     * Good: "Both email fields must match before submission"
     * Bad: "Email field exists"
   - For EACH business rule found, add to `business_rules` array:
     ```json
     "business_rules": [
       "Email confirmation must match original email",
       "Phone prefix must correspond to selected country",
       "Amount must be between 20 and 500",
       "Privacy policy acceptance mandatory before save"
     ]
     ```
   - PROHIBITED: Treating validation rules as "implementation details". They are test requirements.

3a. DETECT USER STATE VARIANTS FROM PRECONDITIONS (new rule):
   - When raw chunks include test case preconditions, parse them to identify STATE DIMENSIONS:
     * Account type: individual/company/admin
     * Completeness: new/incomplete/complete
     * History: first-time/returning
     * Verification: verified/unverified/pending
     * Data presence: has-X/no-X
     * Permission: has-permission/no-permission
     * Market: market-A/market-B (different compliance rules)
   - If 2+ states exist for a dimension, create a separate test path per state:
     ```json
     "precondition_variants": [
       {
         "state": "User has saved phone (verified)",
         "distinctive_flow": "Edit or delete existing phone",
         "scenarios_to_generate": ["Edit phone", "Delete phone", "Change to invalid number"]
       },
       {
         "state": "User has NO phone (new account)",
         "distinctive_flow": "Add phone for first time with OTP verification",
         "scenarios_to_generate": ["Add phone", "Verify OTP", "Timeout re-send"]
       },
       {
         "state": "User is passwordless (OAuth signup)",
         "distinctive_flow": "Cannot add phone until password created",
         "scenarios_to_generate": ["Add phone blocked", "Info panel shown", "Redirect to add password"]
       }
     ]
     ```
   - RATIONALE: Each state has different UI (buttons enabled/disabled, info panels shown/hidden) and different rules. Ignoring variants creates ~20% coverage gaps.
3b. Test areas MUST be:
   - Specific enough to generate 3-10 concrete E2E test scenarios each
   - Independent from each other (minimal overlap)
   - Focused on user-facing behavior, not implementation details
3c. NEGATIVE & BLOCKED STATE MATRIX (CRITICAL):
   - When raw chunks include preconditions, you MUST explicitly ask: "What happens if the user lacks the prerequisite data?"
   - Scan the `business_rules` for missing dependencies and generate variants for them.
   - MANDATORY VARIANTS TO CHECK FOR:
     * Authentication absence: What if the user registered via OAuth (Passwordless)?
     * Data absence: What if the user has no saved phone? No saved addresses?
     * Entity type: Is the user an Individual or a Company?
   - For every negative/blocked state detected, you MUST generate a specific `distinctive_flow` explaining how the UI handles the block (e.g., "Fields disabled, info panel redirects to Add Password").

3d. HARDWARE & ENVIRONMENT STATE MATRIX (MANDATORY for mobile apps):
   - Mobile features frequently depend on hardware capabilities or environment state that can be denied, unavailable, or degraded. These generate DISTINCT test paths that pure UI analysis misses.
   - For ANY test area in a mobile project, scan for these hardware/environment dependencies:
     * **GPS / Location Services**: If the feature uses maps, store locators, delivery address detection, or any geolocation — you MUST add variants: (a) Location granted, (b) Location denied by user, (c) Location services disabled system-wide.
     * **Camera**: If the feature uses barcode scanning, receipt scanning, QR codes, or photo upload — add variants: (a) Camera permission granted, (b) Camera permission denied, (c) Camera unavailable (simulator only).
     * **Network / Offline**: For any feature that makes network calls (payments, order submission, search) — add variants: (a) Online with success response, (b) Offline / airplane mode, (c) Network timeout mid-flow.
     * **Push Notifications**: If the feature sends or handles notifications — add variants: (a) Permission granted, (b) Permission denied.
     * **Biometrics / Face ID**: If the feature uses Face ID, Touch ID, or biometric authentication — add variants: (a) Biometrics available and enrolled, (b) Biometrics not enrolled, (c) Biometrics hardware unavailable.
     * **Apple Wallet / Google Pay**: For payment features — add variants: (a) Wallet configured, (b) Wallet not set up.
   - For EACH hardware/environment dependency detected, add a `precondition_variant` with a `distinctive_flow` describing what the UI does in the denied/unavailable/degraded state. Confidence for these variants should be capped at 0.75-0.80 (automation frameworks can trigger them but cannot always control OS-level permission dialogs reliably).
   - RATIONALE: These states are responsible for ~20% of real production bugs in mobile apps. The "Camera denied" flow looks identical at the coordinator level but shows a completely different UI (permission request dialog → settings redirect vs. scanner opening). Missing these variants creates false test coverage.

4. SPLIT RULE: If a potential area covers multiple independent sub-behaviors that would each yield 3+ scenarios, split it into separate areas. This rule applies ONLY to areas that pass the E2E scope gate (rule 5). PROHIBITED: Splitting a non-E2E area into multiple non-E2E areas.
5. E2E SCOPE — HARD FILTER: Before outputting any test area, apply this gate: "Can a QA engineer verify this behavior by opening a browser, performing user actions, and observing the screen — WITHOUT querying a database, calling an API, or reading server logs?" If the answer is NO, PROHIBITED: do not include the area regardless of evidence strength. Examples that MUST be omitted: score computation algorithms, database constraint validation, background job processing, API response contracts. These belong in unit/integration tests, not E2E test areas.
   If a feature's core behavior is purely backend (e.g., a pricing engine), look for the USER-FACING SURFACE instead: "Price breakdown display on product page" is E2E testable; "Discount calculation algorithm correctness" is not.
6. PROHIBITED: Do not create test areas for non-functional aspects (performance, security) unless they are the feature's core purpose.
7. PROHIBITED: Do not create test areas that duplicate areas already covered by other features. You are scoping THIS feature only.
8. PROHIBITED: Do not create a "General" or "Other" catch-all area. Every area must have a clear scope.
9. If the raw data suggests sub-areas that are too small (1-2 scenarios), merge them into a parent area.
10. Order test areas by confidence (highest first).
11. Target 3-6 test areas per feature. More than 6 usually means over-splitting — merge related areas. Fewer than 3 is acceptable for focused features.
12. Use descriptive area names from the USER'S perspective. Names MUST NOT reference database tables, component names, or internal identifiers.
   - GOOD: "Product Search and Filtering", "User Registration Flow"
   - BAD: "SearchIndex component tests", "auth_users table validation"
```

## User Message Template

```
Feature: {feature_name}
Description: {feature_description}
Sources that back this feature: {feature_source_refs}

Here are the raw data chunks relevant to this feature:

--- RAW CHUNKS ---

{relevant_chunks}

--- END CHUNKS ---

Identify the testable areas within this feature. Respond with a JSON object matching this exact schema:
{output_schema}
```

## Output Schema

```json
{
  "type": "object",
  "required": ["test_areas"],
  "properties": {
    "test_areas": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "feature_id", "name", "description", "source_refs", "confidence", "rationale"],
        "properties": {
          "id": { "type": "string", "description": "Local placeholder id within THIS feature (a01, a02, …). The orchestrator mints globally-unique ids on merge — do NOT emit UUIDs: independent per-feature subagents run in parallel and would collide on identical ids." },
          "feature_id": { "type": "string", "description": "Parent feature ID" },
          "name": { "type": "string", "description": "Short test area name" },
          "description": { "type": "string", "description": "What this area covers and why it needs testing" },
          "business_rules": { 
            "type": "array", 
            "items": { "type": "string" },
            "description": "Validation and business rules extracted from test documentation (e.g., 'Email must match confirmation', 'Amount 20-500', 'Privacy policy mandatory')"
          },
          "precondition_variants": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "state": { "type": "string", "description": "User state (e.g., 'User has verified phone' or 'User is passwordless')" },
                "distinctive_flow": { "type": "string", "description": "What makes this variant different from other variants" },
                "scenarios_to_generate": { "type": "array", "items": { "type": "string" }, "description": "Suggested scenario names for this variant" }
              }
            },
            "description": "Different user state preconditions that require separate test paths"
          },
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

## Evaluation Criteria

1. **Coverage** — Does every significant aspect of the feature have a test area?
2. **Independence** — Are areas truly independent, or do they overlap significantly?
3. **Scoping** — Can you imagine 3-10 concrete E2E scenarios for each area? If fewer, too narrow. If more, split it.
4. **E2E hard filter** — Is every area testable via UI automation? Areas requiring DB/API access MUST be omitted, not flagged.
5. **No catch-alls** — Is there a vague "General" or "Other" area? That's a failure.
6. **No monoliths** — Is there an area covering multiple independent sub-behaviors? Split it.
7. **Evidence** — Do source_refs actually support each area?

## Area Sizing Guidelines

Calibration data from production runs. Use to set expectations, not as hard limits:

### Target: 2-5 areas per feature

| Feature complexity | File count | Expected areas | Example |
|-------------------|-----------|---------------|---------|
| High (checkout, cart) | 80+ files | 4-5 areas | Checkout: address, shipping, payment, review, confirmation |
| Medium (auth, profile) | 30-80 files | 3-4 areas | Auth: email login, registration, social, password recovery |
| Low (newsletter, onboarding) | 15-30 files | 2-3 areas | Onboarding: region selection, permissions flow |
| Infrastructure (config) | N/A | 1-2 areas | Config: payment toggles, feature gating |

### Confidence calibration from real data

| Confidence range | What it means | Examples |
|-----------------|--------------|---------|
| 0.93-0.97 | Rich accessibility IDs, clear user flow, multiple evidence chunks | Product Detail Page (39 IDs), Cart Management (65 IDs), Payment Processing |
| 0.85-0.92 | Good evidence but some UI complexity or automation difficulty | Home Screen (CMS content varies), Address Book, Newsletter Subscription |
| 0.78-0.85 | Testable but involves external systems or OS-level UI | Social Auth (OAuth sheets), Contact Center (external apps), Barcode Scanning |
| 0.60-0.70 | Requires environment config changes before test execution | Feature flag toggles, brand-specific behavior |

### Accessibility ID count as area sizing signal

The `accessibility_map` chunk is the strongest signal for area sizing. High ID count = rich interactive surface = likely needs its own area:

- **65 IDs (Cart)** → dedicated area with many scenarios
- **39 IDs (ProductDetail)** → dedicated area, conversion-critical
- **36 IDs (Register)** → dedicated area, rich form validation
- **15 IDs (MiniCart)** → own area, separate from full cart
- **2-4 IDs (ResetPassword, DeleteAccount)** → merge into parent area, too small alone

### Cross-feature overlap handling

Some test areas naturally touch multiple features. The rule: **assign the area to the feature that OWNS the flow, not every feature it touches**.

Examples from production calibration:
- Gift Card as Payment → assigned to Gift Cards feature, NOT to Checkout, because the gift card-specific logic (entry, stacking, removal) is what's being tested
- Store Search → assigned to Click & Collect feature, NOT to Store Mode, because it's primarily a pickup store selection step
- Shipping Method → assigned to Checkout feature, NOT its own feature, because it's a step within the checkout flow

## Production Calibration — Run #1 (Large Mobile E-commerce App, Single Source — 13 features → 37 test areas)

| Feature | Areas | Highest confidence | Lowest confidence |
|---------|-------|-------------------|------------------|
| f-001 Product Browsing | 5 | 0.97 (PDP) | 0.85 (Home) |
| f-002 Cart & Wishlist | 3 | 0.97 (Cart Mgmt) | 0.88 (Mini Cart) |
| f-003 Checkout & Payment | 5 | 0.95 (Payment) | 0.90 (Address, Confirmation) |
| f-004 Authentication | 4 | 0.95 (Login, Register) | 0.80 (Social Auth) |
| f-005 Profile & Account | 3 | 0.93 (Personal Data) | 0.90 (Address Book) |
| f-006 Order Management | 2 | 0.95 (Order Detail) | 0.90 (Order History) |
| f-007 Returns | 2 | 0.93 (Method Config) | 0.92 (Item Selection) |
| f-008 Click & Collect | 2 | 0.93 (Store Search) | 0.90 (Pickup Options) |
| f-009 Gift Cards | 3 | 0.92 (Purchase) | 0.85 (As Payment) |
| f-010 Store Mode | 2 | 0.88 (Entry/Nav) | 0.85 (Barcode/Stock) |
| f-011 Onboarding | 2 | 0.92 (Region Select) | 0.85 (Permissions) |
| f-012 Newsletter | 2 | 0.88 (Subscription) | 0.78 (Contact) |
| f-013 Remote Config | 2 | 0.65 (Payment Flags) | 0.60 (Feature Gating) |

**Totals**: 37 areas, avg 2.85 per feature, confidence range 0.60–0.97, median 0.90.

## Baseline Validation (when available)

When a human-authored test plan or production test suite exists for the target project, the engine can use it as a baseline to validate coverage. This is optional but highly valuable.

### How it works:
1. The baseline (existing test scenarios/areas) is provided as additional context to the agent, labeled clearly as "BASELINE — existing human QA coverage".
2. The agent uses it as a FLOOR (minimum detection), not a ceiling — the engine should find all baseline items PLUS extras.
3. Every baseline area not covered by the engine's output is flagged as a `coverage_gap`.
4. Baseline areas the engine DOES cover validate the extraction quality.

### Calibration from production:
- Run #1 (no baseline): 37 areas extracted, unknown recall against production tests.
- Run #2 (with baseline of 96 production scenarios): 84 areas extracted. 91% of baseline test areas had a corresponding engine-generated area. The 9% gap was concentrated in infrastructure/config areas that require environment-specific knowledge.

### When to use:
- The engine worker checks if the job's `connector_configs` include a "test plan" source type or if a `baseline_test_plan` field exists in job metadata.
- If present, inject baseline areas into each feature's agent prompt as a reference (not as ground truth — the agent can disagree but must explain why).

## Engine Integration

- **Invocation**: Parallel fan-out — one LLM call per feature from step 2.
- **Input assembly**: For each feature, the engine filters relevant chunks by matching `feature.source_refs[].chunk_id` against `step_1.output.raw_chunks`. The feature description and filtered chunks are formatted using the User Message Template.
- **Model tier**: Extraction model (strong instruction-following for the E2E hard filter).
- **Token budget**: ~1-3K output per feature. Total scales with feature count. Reference: 13 features → ~25K output total; 16 features → ~35K output total.
- **Parallelism**: Full fan-out. All features processed concurrently (up to engine concurrency limit). Results collected and merged after all complete.
- **ID merge strategy**: Each agent outputs local IDs (`a01`, `a02`, …). The orchestrator mints globally-unique IDs (`ta-1000`, `ta-1001`, …) on merge, replacing local IDs and setting `feature_id` to the parent's global ID.
- **Error handling**: If one feature's extraction fails, log the error and continue. The proposal shows the feature without test areas (visible coverage gap).
- **Post-processing**: The orchestrator deduplicates test areas across features — if two features produce areas with >80% name/description overlap, the lower-confidence duplicate is dropped and its `source_refs` merged into the survivor.

### Step Transition (engine worker responsibility)

On completion, the engine worker MUST:
1. Collect all parallel agent results and merge into a single `test_areas[]` array
2. Mint globally-unique IDs (replace local a01/a02 with ta-NNNN)
3. Deduplicate cross-feature overlaps (>80% similarity → merge)
4. Write `output` JSONB + set `status = 'completed'`, `completed_at = now()`
5. Copy `output` → next step's `input` (verbatim JSONB)
6. Set next step's `status = 'running'`, `started_at = now()`
7. Update parent `engine_jobs.updated_at`

Step 4 receives the full test_areas array as its input. It fans out one agent per test area to generate scenarios.

## Production Calibration — Run #2 (Same App, Multi-Source — 16 features → 84 test areas)

Second run on the same app with two sources: code repository + Jira (39 chunks, 16 features). Key observations about multi-source impact on area extraction:

### Actual results

| Feature | Areas | Confidence range |
|---------|-------|-----------------|
| f-001 Authentication | 5 | 0.80–0.95 |
| f-002 Product Detail Page | 6 | 0.85–0.95 |
| f-003 Shopping Cart | 6 | 0.85–0.95 |
| f-004 Checkout | 5 | 0.87–0.95 |
| f-005 Product Search | 5 | 0.72–0.95 |
| f-006 Product Browsing | 5 | 0.62–0.92 |
| f-007 Wishlist | 6 | 0.72–0.95 |
| f-008 User Profile | 4 | 0.78–0.93 |
| f-009 Order Management | 6 | 0.65–0.92 |
| f-010 Returns | 6 | 0.72–0.93 |
| f-011 Stores & C&C | 5 | 0.80–0.92 |
| f-012 Gift Cards | 5 | 0.72–0.90 |
| f-013 Digital Wallet | 6 | 0.58–0.92 |
| f-014 Push & Deep Links | 5 | 0.75–0.92 |
| f-015 Store Mode | 5 | 0.62–0.82 |
| f-016 Help & Contact | 4 | 0.72–0.92 |

**Totals**: 84 areas, avg 5.25 per feature, confidence range 0.58–0.95, median 0.88.

### Lessons learned

1. **More sources = more granular areas.** Run #1 (13 features, source code only) → 37 areas (avg 2.85). Run #2 (16 features, code + Jira) → 84 areas (avg 5.25). Jira issues provide scenario-level detail that causes agents to split areas more aggressively.

2. **Cross-feature dedup is essential.** f-004 (Checkout) and f-011 (Stores) both produced a "Click and Collect store finder" area with >80% overlap. The dedup rule correctly dropped the f-004 duplicate and merged refs into f-011. Without dedup: 85 areas with redundancy.

3. **Feature-flagged features produce lower-confidence areas.** Store Mode (f-015, all areas 0.62–0.82) and Digital Wallet (f-013, receipt scan at 0.58) are feature-flagged, making testability dependent on environment config. The confidence calibration correctly reflects this.

4. **Mega-features need the SPLIT RULE enforced.** Features that absorb many baseline areas (e.g., a User Profile feature covering profile editing, address management, newsletter preferences, and settings) must be split into distinct areas. The agent splits correctly when primed with baseline context, but without it may under-split. Heuristic: if a feature has >6 source_refs AND spans multiple entry points or coordinators, the engine should add a "split aggressively" instruction to the agent prompt.

5. **OS-level UI reduces confidence correctly.** Social auth (0.80), barcode scanner (0.72), Apple Wallet (0.65), receipt scanner (0.58) — all involve iOS system sheets or camera hardware. The E2E hard filter correctly keeps them (the entry point IS testable) but reduces confidence. This is the right behavior.

6. **Jira-only evidence without accessibility IDs = low confidence.** f-006 a05 "Recently Viewed Products" (0.62) has only a Jira To Do task and no accessibility IDs. The agent correctly flagged this. Areas below 0.70 are borderline — they should still appear in the proposal but marked for human review.
