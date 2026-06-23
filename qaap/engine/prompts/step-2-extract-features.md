# Step 2: Extract Features

System prompt for the FeatureExtractionAgent. Receives all raw chunks from step 1 and identifies the high-level features of the application.

## System Prompt

```
You are a senior QA analyst performing feature discovery on a software project. You will receive raw data dumps from one or more sources (GitHub, Jira, Figma, etc.). Your task is to identify the HIGH-LEVEL FEATURES of this application.

A "feature" is a major capability visible to the user — something that would have its own section in a test plan. Examples: "Authentication", "Dashboard", "Search", "Checkout", "User Management".

## Rules

1. ONLY output features you can back with evidence from the provided chunks. Never invent features.
2. Each feature MUST include:
   - `confidence` (0.0-1.0): how confident you are this is a real, distinct feature
   - `rationale`: a plain-language explanation of what this feature does for the user and why it is a distinct capability. Write for a QA reviewer who has not read the source code. Do NOT cite chunk IDs or code identifiers — those belong in `source_refs`.
   - `source_refs`: array of chunk IDs that support this feature
3. Features MUST be at the right abstraction level:
   - TOO BROAD: "Frontend" (that's a layer, not a feature)
   - TOO NARROW: "Login button" (that's a UI element, not a feature)
   - RIGHT: "Authentication" (a user-facing capability)
4. PROHIBITED: Do not group by technical layer (frontend/backend/database). Group by user-facing capability.
5. PROHIBITED: Do not include infrastructure features (CI/CD, deployment) unless the application IS a DevOps tool.
6. Flag coverage gaps: if a feature appears in some sources but not others, this is valuable information. A feature in GitHub but not Jira = code without spec. A feature in Jira but not GitHub = spec not yet implemented.
7. If two sources describe the same feature differently, merge them into one feature and note both source_refs.
8. Order features by confidence (highest first).
9. Target 5-15 features for a typical application. More than 15 usually means over-splitting — merge related capabilities. Fewer than 5 usually means over-grouping — look for distinct sub-capabilities.
10. Feature names MUST be user-facing capabilities in natural language. PROHIBITED: technical layer names, component names, framework terms, or internal identifiers.
   - GOOD: "Invoice Management", "User Authentication", "Dashboard Analytics"
   - BAD: "Redux Store", "API Gateway", "useInvoice Hook"
11. MULTI-SOURCE CONFIDENCE BOOST: When a feature has supporting evidence from 2+ independent source types (e.g., code + Jira, or code + Figma), add +0.05 to the base confidence. Cross-source validation is stronger signal than single-source depth. Note which sources contributed in the `coverage` field.
12. COVERAGE GAPS are a first-class output, not an afterthought. For multi-source runs, every feature SHOULD have a `coverage` entry showing which source types contributed. A feature appearing in only one source is itself a gap worth flagging.
```

## User Message Template

```
Here are raw data dumps from the following sources: {source_list}

Analyze these dumps and identify the high-level features of this application.

--- RAW CHUNKS ---

{chunks}

--- END CHUNKS ---

Respond with a JSON object matching this exact schema:
{output_schema}
```

Where `{chunks}` is formatted as:

```
[{chunk_id}] source={source} type={type}
{content}
---
```

## Output Schema

```json
{
  "type": "object",
  "required": ["features", "coverage_gaps"],
  "properties": {
    "features": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "source_refs", "confidence", "rationale", "coverage"],
        "properties": {
          "id": { "type": "string", "description": "Sequential id assigned in confidence order (f-001, f-002, …). The orchestrator owns the id scheme so later fan-out steps re-link by stable parent id — do NOT emit random UUIDs. (Step 2 is a single call, so no collision, but keeping ids deterministic keeps step-3/4 wiring stable.)" },
          "name": { "type": "string", "description": "Short feature name" },
          "description": { "type": "string", "description": "1-2 sentence description of what this feature does" },
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
          "rationale": { "type": "string" },
          "coverage": {
            "type": "object",
            "description": "Which source types contributed evidence",
            "additionalProperties": { "type": "boolean" }
          }
        }
      }
    },
    "coverage_gaps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["description", "sources_present", "sources_missing"],
        "properties": {
          "description": { "type": "string" },
          "sources_present": { "type": "array", "items": { "type": "string" } },
          "sources_missing": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

## Evaluation Criteria

When testing this prompt against a real project, check:

1. **Completeness** — Did it find all the major features you know about?
2. **Granularity** — Are features at the right level? Not too broad, not too narrow?
3. **Evidence quality** — Do source_refs point to real, relevant chunks?
4. **Confidence calibration** — Are scores reasonable? Features with strong evidence should be high, weak evidence low.
5. **Coverage gaps** — Did it correctly identify features present in some sources but not others?
6. **No hallucination** — Are there any features not supported by the data?

## Feature Merging Guidelines

Deciding what is ONE feature vs TWO is the hardest judgment call in this step. These guidelines come from production calibration:

### Merge INTO the parent feature when:
- The sub-capability is always accessed FROM the parent's flow (e.g., Shipping is always entered from Checkout → merge into Checkout)
- The sub-capability has no standalone entry point in the navigation (e.g., Order Confirmation is only reached after payment → merge into Checkout)
- The sub-capability shares the same coordinator/state (e.g., Store Locator is a screen within Click & Collect flow)

### Keep SEPARATE when:
- The capability has its own tab, menu entry, or deep link (e.g., Cart has its own tab → separate from Checkout)
- The capability has its own coordinator with distinct user flows (e.g., Returns has a 6-step flow separate from Orders)
- The capability can be tested independently in isolation (e.g., Gift Cards can be tested without touching Checkout)
- The capability has significant file count (30+ files) indicating substantial complexity

### Borderline cases (from production calibration):
- **Shipping** → merged INTO Checkout (no standalone entry, always within checkout flow)
- **Order Confirmation** → merged INTO Checkout (post-purchase, same flow)
- **Store Locator** → merged INTO Click & Collect (primarily serves store selection for pickup)
- **Returns** → kept SEPARATE from Order Management (own coordinator, multi-step flow, 30+ files)
- **Gift Cards** → kept SEPARATE from Payment (own coordinator, multiple screens, buy flow + payment method)
- **Remote Config / Feature Flags** → kept as SEPARATE low-confidence feature (not user-facing but critical for QA — flag states change test behavior)

### Cluster-based feature boundaries (new — from Step 1 clustering):

When Step 1 detects and emits CLUSTERED chunks from large files (see Rule 4b in Step 1), 
use these clusters as evidence for SPLITTING a large feature into sub-features:

RULE: If a feature has:
  1. Evidence from clustered chunks (e.g., "Phone Management" chunk separate from "Email Management" chunk)
  2. Distinct entry points in the UI (user taps different cards/sections to enter each cluster)
  3. Different state management (separate view models, coordinators, or data flows)
  4. Different validation rules (one cluster requires OTP, another requires password verification)

THEN: Emit separate sub-features instead of one merged feature.

EXAMPLE (from production calibration):
  Before: "User Profile and Account Settings" (1 feature, 42 scenarios, low specificity)
  After:  Split into sub-features:
    - f-008a: Personal Data & Password Management (14 scenarios)
    - f-008b: Phone Number Management (10 scenarios)
    - f-008c: Billing Address Management (8 scenarios)
    - f-008d: Email Management (10 scenarios)
  
  Each sub-feature:
    - Has distinct entry point (which card user taps)
    - Has different rules (phone requires OTP, email requires password verification)
    - Can be tested independently

RATIONALE: Clustering in Step 1 is not accidental — the codebase author organized these features 
deliberately. Engine MUST respect that structure to avoid over-merging unrelated features, which 
causes Test Areas and Scenarios to become generic ("Account Settings" instead of specific).

## Chunk Type Routing

Different chunk types serve different purposes during feature extraction. Use this guide to weight evidence:

| Chunk type | Feature extraction value | How to use |
|------------|------------------------|------------|
| `accessibility_map` | ⭐⭐⭐ Highest | Each section = a screen. Member count indicates UI complexity. The richest source for feature surface area. |
| `feature_tree` | ⭐⭐⭐ High | File counts indicate feature size and complexity. Large features (50+ files) are almost certainly distinct. |
| `coordinator` | ⭐⭐⭐ High | Each coordinator = a user flow. Flow methods reveal decision points and branching. |
| `view_model` | ⭐⭐ Medium-high | Published state and actions reveal what users can DO within a feature. |
| `navigation_structure` | ⭐⭐ Medium | Tab bar entries = top-level features. Navigator actions = all reachable screens. |
| `ui_structure` | ⭐⭐ Medium | Screen inventory when no coordinator/view_model chunk exists. |
| `config` | ⭐ Low-medium | Feature flags reveal feature boundaries but aren't features themselves (unless testing the config system). |
| `documentation` | ⭐ Low | Context about the team and project, rarely defines feature boundaries. |
| `repo_metadata` | ⭐ Low | Project-level context, not feature-level. |

## Production Calibration Data (Single Source — 30 chunks → 13 features)

Calibration data from a production run on a large mobile e-commerce app (single source: code repository). Use to calibrate expectations for similar-scale projects.

| Metric | Value |
|--------|-------|
| Input chunks | 30 (all from storage/code source) |
| Features extracted | 13 |
| Confidence range | 0.80 – 0.98 |
| Average confidence | 0.92 |
| Source refs per feature | 3–7 (avg 4.2) |
| Coverage gaps | 3 (single-source, no backend API, missing promo chunks) |
| Token budget | Input ~40K tokens (30 chunks), Output ~5K tokens |

### Feature list produced (large mobile e-commerce app, single code source):

| ID | Feature | Confidence | Key evidence |
|----|---------|-----------|-------------|
| f-001 | Product Browsing & Discovery | 0.98 | 7 chunks: search, detail, filters, navigation, accessibility (39+15+9+8 IDs) |
| f-002 | Shopping Cart & Wishlist | 0.98 | 4 chunks: cart VM, wishlist, accessibility (65+23+15 IDs) |
| f-003 | Checkout & Payment | 0.97 | 6 chunks: checkout coord (110KB), payment coord, shipping, resume, confirmation |
| f-004 | User Authentication | 0.97 | 5 chunks: login VM, app coordinator, accessibility (10+36+4+4 IDs), config flags |
| f-005 | User Profile & Account | 0.95 | 4 chunks: 120 files, 7 subfeatures, accessibility (27+10+14+4 IDs) |
| f-006 | Order Management | 0.95 | 4 chunks: order detail VM, orders banner (61 files), accessibility (13+8 IDs) |
| f-007 | Returns & Refunds | 0.93 | 4 chunks: 38 files, 6-step coordinator flow, config flag |
| f-008 | Click & Collect | 0.93 | 4 chunks: 52 files + 22 files (PlaceLocator), accessibility (12+9+7+8 IDs) |
| f-009 | Gift Cards | 0.90 | 3 chunks: 5 screens, dual-use (buy + payment), accessibility (37 IDs) |
| f-010 | Store Mode (Scan & Shop) | 0.90 | 4 chunks: dedicated tab, barcode scanner, stock check |
| f-011 | Onboarding | 0.88 | 3 chunks: 50 files, 5-step wizard (region → auth → permissions → ATT → push) |
| f-012 | Newsletter & Communications | 0.85 | 3 chunks: 27 files, 3 coordinators, contact channels, config flags |
| f-013 | Remote Configuration & Feature Flags | 0.80 | 3 chunks: 80+ flags, brand settings — NOT user-facing but critical for QA |

### Decision log:
- **Shipping merged into Checkout** — no standalone entry, always within checkout flow
- **Confirmation screen merged into Checkout** — post-purchase, same flow
- **Store Locator merged into Click & Collect** — primarily serves pickup store selection
- **Contact merged into Newsletter & Communications** — small feature (<10 files), fits communications
- **Remote Config included at 0.80** — infrastructure, but flag states are a first-class QA concern (a test that passes with flag ON may fail with flag OFF)
- **Promotions NOT included** — no coordinator/view_model chunk collected in Step 1, only appeared in file tree. Flagged as coverage gap instead of inventing a feature.

## Production Calibration Data (Multi-Source — 39 chunks → 16 features)

Calibration data from a production run on the same app with two sources (code repository + Jira). Use to calibrate expectations for multi-source runs.

| Metric | Value |
|--------|-------|
| Input chunks | 39 (29 code + 10 Jira) |
| Features extracted | 16 |
| Confidence range | 0.72 – 0.95 |
| Average confidence | 0.89 |
| Source refs per feature | 2–8 (avg 4.8) |
| Coverage gaps | 5 (more gaps detected due to cross-source comparison) |

### Key observations vs single-source:

| Dimension | Single source (30 chunks) | Multi-source (39 chunks) | Delta |
|-----------|--------------------------|--------------------------|-------|
| Features | 13 | 16 | +23% |
| Avg confidence | 0.92 | 0.89 | −3% (wider confidence range is expected) |
| Avg source_refs | 4.2 | 4.8 | +14% |
| Coverage gaps | 3 | 5 | +67% |

### Multi-source specific lessons:

1. **Cross-source correlation boosts confidence.** A feature backed by BOTH code and Jira evidence is more likely real and well-specified than one backed by a single source. When correlating sources, add +0.05 to base confidence for features confirmed by 2+ independent source types.

2. **Jira reveals planned-but-unbuilt features.** Features that appear in Jira (epics, stories) but have no code evidence are valuable coverage gaps — they represent functionality that was specced but may not yet be implemented, or was implemented under a different name. Always flag these.

3. **Code reveals undocumented features.** Features visible in code but absent from Jira may be tech debt, internal tooling, or simply untracked work. These typically get lower confidence (0.72–0.80) but should still be included.

4. **More sources = more features, wider confidence range.** Single-source runs produce a tighter cluster (0.80–0.98). Multi-source runs have a wider spread (0.72–0.95) because Jira-only evidence is weaker than code evidence but still worth capturing.

5. **Coverage gaps are a HIGH-VALUE output.** In multi-source runs, gaps become richer: "feature X is in Jira but not in code" and "feature Y is in code but not in Jira" tell different stories. The QA lead uses these gaps to decide whether to request deeper exploration or flag spec/implementation misalignment.

## Engine Integration

- **Invocation**: Single LLM call. All raw chunks from step 1 are passed in the user message.
- **Input assembly**: The engine reads `step_1.output.raw_chunks`, formats each chunk using the template format (`[chunk_id] source=... type=...\n{content}\n---`), and sends the complete block in the user message.
- **Model tier**: Extraction model (strong reasoning, does not need tool use).
- **Token budget**: Input can be large (all chunks concatenated). Expect ~40K input tokens for 30 chunks, ~5K output tokens for 10-15 features. Total ~45K tokens.
- **Parallelism**: None — single call with all data. Cross-source feature correlation requires seeing all chunks at once.
- **Error handling**: Validate JSON output against the schema. Verify all `source_refs[].chunk_id` reference real chunk IDs from step 1. Retry once on invalid JSON or schema mismatch.
- **ID assignment**: The engine trusts the agent's sequential IDs (`f-001`, `f-002`, …) since this is a single call with no collision risk.

### Step Transition (engine worker responsibility)

On completion, the engine worker MUST:
1. Write `output` JSONB + set `status = 'completed'`, `completed_at = now()`
2. Copy `output` → next step's `input` (verbatim JSONB)
3. Set next step's `status = 'running'`, `started_at = now()`
4. Update parent `engine_jobs.updated_at`

Step 3 receives the full features array + coverage_gaps as its input. It fans out one agent per feature.
