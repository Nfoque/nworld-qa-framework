---
name: research-gaps
description: Cross-reference research insights and patterns against what's actually materialized in the framework and QAAP docs. Find adopted decisions that haven't been implemented yet. Use when the user says "qué falta", "research gaps", "qué no está materializado", or invokes `/research-gaps`.
---

# research-gaps — find unmaterialized research decisions

## When to invoke

User says any of:
- "qué falta", "qué no está materializado"
- "research gaps", "unmaterialized insights"
- "qué hemos adoptado pero no hecho"
- `/research-gaps`

## What it does

Scans `research/insights.md` and `research/patterns.md` for items marked as "Adopt" that don't yet have a `Materialized in:` reference — or whose reference points to a file that says "placeholder", "pending", or "does not exist".

## Step 1: Scan insights.md

For each `### ` entry in `research/insights.md`:

1. Find the `Decision/action:` line
2. If it says "Adopt" or "Adopt como...":
   - Check if there's a `Materialized in:` line
   - If yes: verify the referenced file exists and doesn't contain "placeholder" / "genuinely new" / "does not exist" / "pending"
   - If no `Materialized in:`: this is a **gap**

Classify each:
- **✅ Materialized**: has reference, file exists, content is substantive
- **⚠️ Parcial**: has reference but target file still says pending/placeholder
- **❌ Not materialized**: adopted but no `Materialized in:` line at all

## Step 2: Scan patterns.md

For each `### ` entry in `research/patterns.md`:

1. Check `Implication for qa-framework:` — is this reflected in any framework file?
2. Check `Implication for QAAP:` (if present) — is this reflected in any QAAP doc?
3. Cross-reference with `qa-framework/STATUS.md` to see if it's tracked

## Step 3: Check STATUS.md consistency

Read `qa-framework/STATUS.md`:
- Items in "Genuinely new" that now have research backing → should move to "Partial base"
- Items in "Partial base" that now have implementation → should move to "Covered"

## Step 4: Generate report

```
## Research Gaps Report

### Insights adoptados sin materializar (❌)
| Insight | Decision | Where it should go |
|---------|----------|-----------------|

### Insights parcialmente materializados (⚠️)
| Insight | Materialized in | What's missing |
|---------|-----------------|-----------|

### Patrones sin reflejo en framework/QAAP
| Pattern | Implication | Target file |
|--------|-------------|---------------|

### STATUS.md inconsistencies
| Item | Current category | Should be | Why |
|------|-----------------|-------------|---------|

### Estadísticas
- Total insights: N (X adoptados, Y prototipar, Z estudiar/monitorear)
- Materializeds: N/X (ratio)
- Patterns con implicación framework: N/M reflejados
- Patterns con implicación QAAP: N/M reflejados
```

## Step 5: Suggest actions

For each gap with clear target file, suggest the concrete edit. Don't apply — present to the user for confirmation.
