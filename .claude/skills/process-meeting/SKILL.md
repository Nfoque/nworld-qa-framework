---
name: process-meeting
description: Process a client meeting transcript from `clients/<client>/<project>/transcripts/raw/`. Extracts testing needs, cross-references with research, generates structured meeting analysis, and updates project state. Use when the user says "procesa la reunión", "process meeting", or invokes `/process-meeting`.
---

# process-meeting — extract testing needs from a client transcript

## When to invoke

User says any of:
- "procesa la reunión de <client>"
- "procesa transcripts de <client>"
- "process meeting <path>"
- `/process-meeting <client>/<project>` or `/process-meeting <path-to-transcript>`

## Inputs

Either:
- `<client-slug>/<project-slug>` — find the latest unprocessed transcript in that project's `transcripts/raw/`
- Direct path to a transcript file

## Step 1: Locate and read the transcript

Look in `clients/<client>/<project>/transcripts/raw/` for unprocessed files.
If the file is a Fathom JSON export, check if the `rawlie-agentic-tooling:fathom-slim-transcript` skill is available and use it to produce a slim version in `transcripts/processed/`. Otherwise read the raw file directly.

## Step 2: Extract testing needs

From the transcript, identify every mention of testing, QA, quality, automation, regression, or related concepts. For each need, capture:

- **Type**: functional / E2E / performance / security / LLM eval / RAG / agentic / regression / other
- **Context literal**: the actual quote or paraphrase from the transcript
- **Volume / urgency**: how much emphasis the client gave it

## Step 3: Cross-reference with research

Read `research/insights.md` and `research/patterns.md`. For each testing need:

- **Covered** (✅): map to specific insight/pattern with anchor link
- **Partially covered** (⚠️): note what's missing
- **Gap** (❌): not addressed by current framework

## Step 4: Generate meeting analysis

Write to `clients/<client>/<project>/meetings/YYYY-MM-DD-topic.md` using the template from `clients/README.md`:

```markdown
---
client: <client-slug>
project: <project-slug>
date: YYYY-MM-DD
attendees: [from transcript if available]
duration_min: [from transcript if available]
source: Fathom / Zoom / Teams / otro
status: ✅ analizado
---

# Reunión: <topic>

## Executive summary (1-3 sentences)

## Testing needs identified
| Type | Literal context from transcript | Volume / urgency |

## Mapping to current framework
| Need | Coverage | Anchor |

## Gaps detected
- **Gap 1:** ...

## Decisions / agreed next steps

## Relevant quotes
> "..."
```

## Step 5: Update project-state.md

Update `clients/<client>/<project>/project-state.md`:
- Set `Last meeting:` to today's date
- Merge new testing needs into the consolidated list
- Update coverage mapping (✅/⚠️/❌)
- Add meeting to the `History` list

## Step 6: Check for cross-client patterns

Read `research/client-signals.md`. If any gap from this meeting matches a gap from a **different** client (not just a different project of the same client), propose promoting it as a new client signal. Present to the user before writing.

## Output

Summary to the user:
- N testing needs identified
- Coverage: X✅ / Y⚠️ / Z❌
- Gaps that match cross-client signals (if any)
- Path to the generated meeting file
