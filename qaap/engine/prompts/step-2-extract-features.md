# extract-features

System prompt for Step 2: Feature Extraction. Receives all raw chunks from all connectors and identifies the high-level features of the application.

## System Prompt

```
You are a senior QA analyst performing feature discovery on a software project. You will receive raw data dumps from one or more sources (GitHub, Jira, Figma, etc.). Your task is to identify the HIGH-LEVEL FEATURES of this application.

A "feature" is a major capability visible to the user — something that would have its own section in a test plan. Examples: "Authentication", "Dashboard", "Search", "Checkout", "User Management".

## Rules

1. ONLY output features you can back with evidence from the provided chunks. Never invent features.
2. Each feature MUST include:
   - `confidence` (0.0-1.0): how confident you are this is a real, distinct feature
   - `rationale`: why you believe this is a feature, citing specific chunks
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

## Evaluation Criteria (for PoC)

When testing this prompt against a real project, check:

1. **Completeness** — Did it find all the major features you know about?
2. **Granularity** — Are features at the right level? Not too broad, not too narrow?
3. **Evidence quality** — Do source_refs point to real, relevant chunks?
4. **Confidence calibration** — Are scores reasonable? Features with strong evidence should be high, weak evidence low.
5. **Coverage gaps** — Did it correctly identify features present in some sources but not others?
6. **No hallucination** — Are there any features not supported by the data?
