# Step 5: Generate Proposal

Pure aggregation step — NO LLM call. The engine worker collects outputs from steps 1-4 and assembles the final proposal for human review.

This is the only step that does not invoke an LLM. It runs deterministic code.

## Input

The step receives `step_4.output` as its input, which contains:
- `scenario_groups[]` — one group per test area, each with `background` + `scenarios[]`
- `summary` — total_scenarios, per_feature counts, confidence distribution

The engine worker also reads `step_1.output`, `step_2.output`, and `step_3.output` from the database to build the full proposal tree.

## Proposal Assembly

The engine worker MUST:

1. **Read all step outputs** from the database (steps 1-4 for this job)
2. **Build the feature tree**: features → test_areas → scenarios (nested hierarchy)
   - Each feature gets its test areas from step 3
   - Each test area gets its scenarios from step 4
   - Compound IDs (`f-001/a01`) link the levels
3. **Build project metadata** from step 1's raw_chunks (repo stats, tech stack)
4. **Aggregate summaries**:
   - Total features, test areas, scenarios
   - Confidence averages and medians per level
   - Per-feature scenario counts
5. **Include coverage gaps** from step 2 (sources present vs missing)
6. **Detect additional gaps**: Compare step 1 raw_chunks against step 2 features — any chunks not referenced by any feature indicate unexplored functionality
7. **Write `output` JSONB** with the full proposal

## Output Schema

```json
{
  "version": "1.0.0",
  "generated_at": "ISO-8601 timestamp",
  "pipeline_job_id": "UUID",
  
  "project": {
    "name": "string",
    "type": "mobile_ios | web_spa | backend_api | ...",
    "tech_stack": ["string"],
    "repo_stats": { "...project-specific metrics" }
  },
  
  "summary": {
    "features": "number",
    "test_areas": "number",
    "scenarios": "number",
    "raw_chunks": "number",
    "confidence": {
      "features_avg": "number",
      "test_areas_avg": "number",
      "scenarios_avg": "number",
      "scenarios_median": "number"
    },
    "coverage_gaps": "array (from step 2)"
  },
  
  "features": [
    {
      "id": "f-001",
      "name": "string",
      "description": "string",
      "confidence": "number",
      "test_area_count": "number",
      "scenario_count": "number",
      "test_areas": [
        {
          "id": "a01",
          "compound_id": "f-001/a01",
          "name": "string",
          "description": "string",
          "confidence": "number",
          "background": "Gherkin Background block",
          "scenario_count": "number",
          "scenarios": [
            {
              "id": "s01",
              "test_area_id": "f-001/a01",
              "name": "string",
              "description": "Markdown acceptance criteria (MUST NOT be empty)",
              "gherkin": "Scenario: ...",
              "confidence": "number",
              "rationale": "string",
              "source_refs": [{ "chunk_id": "string", "source": "string", "type": "string" }]
            }
          ]
        }
      ]
    }
  ],
  
  "detected_gaps": [
    {
      "area": "string (e.g., Deep linking)",
      "description": "string (what was found but not covered)",
      "severity": "low | medium | high"
    }
  ]
}
```

## SPA Integration

The proposal is displayed in the SPA's proposal review screen (`/pipelines/:jobId/review`). The SPA reads the proposal from `step_5.output`.

The SPA reads proposal data directly from `step_5.output` (root level, no wrapper key). The `features`, `summary`, `coverage_gaps`, and `detected_gaps` keys are consumed as-is by the proposal review page.

## Step Transition (engine worker responsibility)

On completion, the engine worker MUST:
1. Build the proposal from steps 1-4 outputs
2. Write `output` JSONB + set `status = 'completed'`, `completed_at = now()`
3. **Set parent job `status = 'paused'`** (NOT 'completed')
4. Update parent `engine_jobs.updated_at`

**CRITICAL — `paused`, not `completed`**: The job transitions to `paused` after Step 5, NOT `completed`. The SPA shows the "Review Proposal" button ONLY when `job.status === 'paused'`. The job moves to `completed` only after the user accepts the proposal in the SPA. Setting the job to `completed` prematurely hides the review button and breaks the handoff flow.

The lifecycle is:
```
queued → running → paused (proposal ready for review) → completed (user accepted)
                 ↘ failed (any step errored)
```

## Project Type → Modality Mapping

The `project.type` field in the proposal determines how downstream consumers (accept-proposal Edge Function, test plan views, future code generation) interpret the scenarios. The engine detects project type from Step 1 metadata (repo language, framework markers, file extensions).

| project.type | Gherkin verb set | Navigation model | Confidence modifiers |
|-------------|-----------------|-----------------|---------------------|
| `mobile_ios` | tap, swipe, scroll, long-press | screen/tab-based | OS dialogs cap 0.75-0.80, camera/GPS cap 0.78-0.83 |
| `mobile_android` | tap, swipe, scroll, long-press | screen/activity-based | OS dialogs cap 0.75-0.80, camera/GPS cap 0.78-0.83 |
| `web_spa` | click, type, hover, drag, select | URL/route-based | Tab/window mgmt cap 0.80 |
| `web_ssr` | click, type, hover, select | URL-based (full page loads) | Server-rendered state caps at 0.85 |
| `desktop` | click, type, keyboard shortcuts | window-based | OS dialogs cap 0.75-0.80, multi-window cap 0.78 |
| `backend_api` | N/A (not E2E testable) | N/A | All scenarios capped at 0.50 |

The `accept-proposal` Edge Function uses `project.type` to:
1. Validate Gherkin verb consistency (flag mobile scenarios using "click" instead of "tap")
2. Set default test framework suggestions in the materialized test plan metadata
3. Apply platform-specific confidence floor adjustments

## Production Calibration Data (Large Mobile E-commerce App)

| Metric | Value |
|--------|-------|
| Proposal size | ~423 KB |
| Features | 13 |
| Test areas | 37 |
| Scenarios | 366 |
| Detected gaps | 9 |
| Coverage gaps (from step 2) | 3 |
| Execution time | ~30 seconds (pure aggregation) |

### Detected gaps (from production calibration):

| Gap | Severity | Description |
|-----|----------|-------------|
| Deep linking | medium | Navigator has pushCategory(categoryId, link) but no dedicated test area |
| Push notifications | medium | Only permission tested, not arrival/tap behavior |
| Recently viewed | low | Mentioned in DetailViewModel, no test area |
| Apple Wallet | low | Mentioned in MyAccountDetails/OrderDetail |
| Pro user features | low | proUserLabel visible but no tests for what it unlocks |
| Rewards program | medium | rewardsCell in Profile, no accumulation/redemption tests |
| Favourite stores | low | Only partially tested within Store Mode |
| Store receipts | low | storePurchaseCell exists, no dedicated area |
| Promotions | medium | Feature tree shows 42 files but no chunks were collected |

These gaps are valuable for the user — they highlight what the pipeline DIDN'T cover and why, helping the QA lead decide whether to request a deeper exploration or accept the current coverage.

### Multi-source run calibration:

| Metric | Single source | Multi-source (code + Jira) |
|--------|--------------|---------------------------|
| Features | 13 | 16 |
| Test areas | 37 | 84 |
| Scenarios | 366 | ~880 (estimated at 10.5 avg/area) |
| Detected gaps | 9 | 12+ |
| Coverage gaps | 3 | 5 |
| Proposal size | ~423 KB | ~1.1 MB (estimated) |

Multi-source proposals are significantly larger. The SPA's proposal review page must handle tree rendering efficiently at this scale.

### Gap taxonomy:

Detected gaps fall into predictable categories. The engine should classify each gap:

| Category | Description | Example |
|----------|-------------|---------|
| `unexplored_code` | Code exists but no chunks were collected in Step 1 | File tree shows 40+ files for a feature but no coordinator/VM chunk |
| `spec_only` | Feature appears in Jira/Figma but has no code evidence | Epic with stories but no matching source code |
| `code_only` | Feature exists in code but has no spec/ticket | Implemented functionality with no Jira tracking |
| `partial_coverage` | Feature has test areas but some aspects lack scenarios | Deep linking mentioned in code but no dedicated test area |
| `infra_gap` | Infrastructure/config that affects test behavior | Feature flags, environment configs, third-party integrations |
