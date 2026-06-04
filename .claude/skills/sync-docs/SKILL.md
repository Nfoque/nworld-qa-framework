---
name: sync-docs
description: Audit and synchronize all README.md and CLAUDE.md files across the repo so they reflect the current state of research, framework, and QAAP. Use when the user says "sync docs", "actualiza READMEs", "sync indexes", or invokes `/sync-docs`.
---

# sync-docs — synchronize all index and documentation files

## When to invoke

User says any of:
- "sync docs", "sincroniza los docs"
- "actualiza READMEs", "update readmes"
- "sync indexes", "sincroniza los índices"
- `/sync-docs` (slash command form)

## What it does

Audits every README.md and CLAUDE.md in the repo against the actual content, then fixes discrepancies so everything is consistently indexed and cross-referenced.

## Files to audit (in order)

### 1. `news/README.md` — Article index table

- Count `.md` files in `news/inbox/` (excluding `raw/`)
- Compare against rows in the index table
- For each file not in the table: add a row (date, title from frontmatter, author, status from frontmatter, one-line notes)
- For each row in the table without a matching file: flag as orphan
- Verify the count matches

### 2. `research/insights.md` — Insight count

- Count `### ` headers (excluding the format template)
- Note how many have `Materialized in:` (connected to framework/QAAP)

### 3. `research/patterns.md` — Pattern count

- Count `### ` headers (excluding the format template)
- Note how many have `Implication for qa-framework:` or `Implication for QAAP:`

### 4. `qa-framework/README.md`

- **Pipeline diagram**: must reflect current steps in `protocol/v0.1-generation-protocol.md`
- **Parsers section**: status descriptions must match each parser's `README.md` (especially jira — was placeholder, now has spec draft)
- **Principles list**: must match what's in `research/insights.md` (count the adopted ones)
- **Parser status table in protocol**: cross-check against `STATUS.md`

### 5. `qa-framework/STATUS.md`

- Items in "Genuinely new" vs "Partial base" — verify none have moved category based on new research
- Cross-check against parsers/ READMEs and protocol doc

### 6. `qaap/README.md`

- Article count in "Research Foundation" must match `news/inbox/` file count
- Feature list ("What QAAP Does") must reflect current `llm-pipeline-spec.md` stages
- Pattern list must reflect current `patterns.md` pattern names

### 7. `qaap/CLAUDE.md`

- Same counts as qaap/README.md
- Design Principles list must match root `CLAUDE.md` principles
- Pipeline module descriptions must reflect `llm-pipeline-spec.md`

### 8. Root `CLAUDE.md`

- Article count must match `news/inbox/` file count
- Principle list must be superset of what's in `qa-framework/README.md` and `qaap/CLAUDE.md`
- Workflow descriptions must be current

### 9. Root `README.md`

- Organization tree must list all top-level directories that exist
- Must mention both products (qa-framework + QAAP)
- Article count annotation must match reality

## How to fix discrepancies

- **Counts**: update the number to match reality
- **Missing index entries**: add them following existing format
- **Stale descriptions**: update to match the source of truth (the actual spec file, not the index)
- **Missing principles**: add them — the source of truth is `research/insights.md` (adopted items)
- **Orphan entries**: flag to the user, don't delete

## Output

Report a summary table to the user:

```
| File | Status | Changes |
|------|--------|---------|
| news/README.md | ✅ in sync | — |
| qa-framework/README.md | 🔧 fixed | Updated parser status, added principle #7 |
| ... | ... | ... |
```

## Idempotency

Running this skill when everything is already in sync produces no changes and reports "all in sync".
