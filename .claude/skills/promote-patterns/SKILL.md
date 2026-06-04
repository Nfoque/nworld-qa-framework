---
name: promote-patterns
description: Scan insights.md for findings that now appear in 2+ independent sources and should be promoted to patterns.md. Also update existing patterns with new source appearances. Use when the user says "promote patterns", "busca patrones nuevos", or invokes `/promote-patterns`.
---

# promote-patterns — find insights ready to become patterns

## When to invoke

User says any of:
- "promote patterns", "busca patrones nuevos"
- "hay insights que ya sean patrones?"
- "actualiza apariciones de patrones"
- `/promote-patterns`

## What it does

An insight becomes a pattern when the same idea appears in **2+ independent sources**. This skill automates that detection.

## Step 1: Index existing patterns

Read `research/patterns.md`. For each `### ` entry, extract:
- Pattern name
- List of sources from `Appearances:` 

## Step 2: Scan insights for promotion candidates

Read `research/insights.md`. For each `### ` entry, extract:
- Insight name
- Source from `Origen:`
- Any "Reforzado por" or cross-references to other sources

An insight is a **promotion candidate** if:
- Its `Origen:` mentions 2+ distinct authors/articles (e.g., "Reforzado por X")
- OR it cross-references another insight that covers the same idea from a different source
- AND it doesn't already exist as a pattern in `patterns.md`

## Step 3: Check for new appearances of existing patterns

For each pattern in `patterns.md`, scan `insights.md` for insights that cover the same concept but aren't listed in the pattern's `Appearances:`. An insight matches a pattern if:
- It describes the same technique/principle
- It comes from a source not already in `Appearances:`

## Step 4: Present findings

```
## Promotion Candidates (insight → pattern)

| Insight | Sources | Matches existing pattern? |
|---------|---------|--------------------------|
| ... | Author A, Author B | No — new pattern |
| ... | Author C, Author D | Yes — merge into "XYZ" |

## Existing Patterns with New Appearances

| Pattern | Current sources | New source to add |
|---------|----------------|-------------------|
| ... | A, B, C | D (from insight "...") |

Promote candidates and update appearances?
```

## Step 5: Apply (with confirmation)

For each confirmed promotion:
1. Create new entry in `patterns.md` following the format (Appearances, Description, Implication)
2. Cross-reference the source insights
3. Add `Implication para qa-framework:` and `Implication para QAAP:` based on the insight's `Decision/action:`

For each new appearance:
1. Add the new source to the pattern's `Appearances:` list
2. Update the description if the new source adds nuance
