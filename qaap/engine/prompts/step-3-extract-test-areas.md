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
3. Test areas MUST be:
   - Specific enough to generate 3-10 concrete E2E test scenarios each
   - Independent from each other (minimal overlap)
   - Focused on user-facing behavior, not implementation details
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

1. **Coverage** — Does every significant aspect of the feature have a test area?
2. **Independence** — Are areas truly independent, or do they overlap significantly?
3. **Scoping** — Can you imagine 3-10 concrete E2E scenarios for each area? If fewer, too narrow. If more, split it.
4. **E2E hard filter** — Is every area testable via browser automation? Areas requiring DB/API access MUST be omitted, not flagged.
5. **No catch-alls** — Is there a vague "General" or "Other" area? That's a failure.
6. **No monoliths** — Is there an area covering multiple independent sub-behaviors? Split it.
7. **Evidence** — Do source_refs actually support each area?

## Engine Integration

- **Invocation**: Parallel fan-out — one LLM call per feature from step 2.
- **Input assembly**: For each feature, the engine filters relevant chunks by matching `feature.source_refs[].chunk_id` against `step_1.output.raw_chunks`. The feature description and filtered chunks are formatted using the User Message Template.
- **Model tier**: Extraction model (strong instruction-following for the E2E hard filter).
- **Token budget**: ~1-3K output per feature. Total scales with feature count.
- **Parallelism**: Full fan-out. All features processed concurrently (up to engine concurrency limit). Results collected and merged after all complete.
- **ID merge strategy**: Each agent outputs local IDs (`a01`, `a02`, …). The orchestrator mints globally-unique IDs (`ta-1000`, `ta-1001`, …) on merge, replacing local IDs and setting `feature_id` to the parent's global ID.
- **Error handling**: If one feature's extraction fails, log the error and continue. The proposal shows the feature without test areas (visible coverage gap).
- **Post-processing**: The orchestrator deduplicates test areas across features — if two features produce areas with >80% name/description overlap, the lower-confidence duplicate is dropped and its `source_refs` merged into the survivor.
