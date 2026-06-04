---
name: research-status
description: Generate a dashboard of the research and framework state — article counts, insight/pattern coverage, materialization ratios, parser status, and areas that need attention. Use when the user says "research status", "estado del research", "dashboard", or invokes `/research-status`.
---

# research-status — research and framework health dashboard

## When to invoke

User says any of:
- "research status", "estado del research"
- "dashboard", "report de estado"
- "cómo vamos", "how are we doing"
- `/research-status`

## What it produces

A single-screen dashboard with counts, ratios, and flags for areas needing attention.

## Data to collect

### 1. Articles (`news/`)

- Count `.md` files in `news/inbox/` (excluding `raw/`)
- Count by status: ✅ distilled / 🔍 under review / 🔲 new / ❌ discarded
- Count unprocessed files in `news/inbox/raw/` (not in `raw/processed/`)
- Date range: oldest → newest article

### 2. Research synthesis

**Insights (`research/insights.md`):**
- Total `### ` entries (excluding format template)
- By decision: Adoptar / Prototipar / Estudiar / Monitorear / Descartar
- By materialization: has `Materialized in:` vs doesn't
- Materialization ratio: materialized / adopted

**Patterns (`research/patterns.md`):**
- Total `### ` entries (excluding format template)
- Average sources per pattern (count items in `Appearances:`)
- Patterns with `Implication for QAAP:` vs without

**Client signals (`research/client-signals.md`):**
- Total signals
- By coverage: ✅ / ⚠️ / ❌
- Note the `[1c-3e]` caveat if still only one client

### 3. Framework status (`qa-framework/`)

**Parsers:**
- Status of each: Partial / Spec draft / Placeholder / Implemented

**STATUS.md categories:**
- Count items in: "Covered by pilot" / "Partial base in research" / "Partial base from Nesvitii" / "Genuinely new"

**ADRs:**
- Count accepted / pending / superseded

**Protocol:**
- Pipeline steps count
- Prompt templates count

### 4. QAAP status (`qaap/`)

- Documentation files count
- MVP phases: which phase we're in
- Prompt templates defined in llm-pipeline-spec.md
- Connectors defined in connector-spec.md (by phase)

### 5. Skills (`.claude/skills/`)

- Count of available skills
- List with one-line descriptions

## Output format

```
# 📊 Research & Framework Status — YYYY-MM-DD

## Articles
- Total: N processed | M unprocessed in raw/
- Date range: YYYY-MM-DD → YYYY-MM-DD
- All ✅ distilled: yes/no

## Research
| | Total | Adopted | Materialized | Ratio |
|--|-------|---------|-------------|-------|
| Insights | N | X | Y | Y/X% |
| Patterns | N | — | — | — |
| Client signals | N | — | — | — |

## Framework (qa-framework)
| Component | Status |
|-----------|--------|
| Source Code parser | Partial |
| OpenAPI parser | Partial |
| Jira parser | Spec draft |
| Test Conventions parser | Partial |
| Context Assembler | ❌ genuinely new |
| Validation loop | Spec (from Nesvitii) |
| DOM inspection | Spec (from Nesvitii) |
| ADRs | N accepted |
| Pipeline steps | N defined |

## QAAP
- Phase: 1 (MVP) — not started / in progress / done
- Docs: N files
- Prompt templates: N defined
- Connectors: N Phase 1 + M Phase 2 + ...

## Skills
- N skills available
[list]

## ⚠️ Attention needed
- [items that look stale, gaps, inconsistencies]
```

## No changes made

This skill is read-only — it reports state but doesn't modify any files.
