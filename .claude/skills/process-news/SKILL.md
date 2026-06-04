---
name: process-news
description: Read all unprocessed articles from `news/inbox/raw/`, distill each into a structured summary, extract insights for `research/`, and propose changes to the framework and QAAP. Use when the user says "procesa el inbox", "procesa noticias", "process news", or invokes `/process-news`.
---

# process-news — batch-process unprocessed articles and extract framework improvements

## When to invoke

User says any of:
- "procesa el inbox", "procesa noticias"
- "process news", "process inbox"
- "hay artículos nuevos"
- `/process-news` (slash command form)

## What it does

1. Finds all unprocessed articles in `news/inbox/raw/`
2. Distills each into a structured summary
3. Extracts new insights and patterns for `research/`
4. Proposes concrete changes to `qa-framework/` and `qaap/` docs
5. Applies changes (with user confirmation for framework/QAAP impact)

## Step 1: Find unprocessed articles

```bash
# Files in raw/ that are NOT in raw/processed/
ls news/inbox/raw/
ls news/inbox/raw/processed/
```

Unprocessed = files in `raw/` that don't have a matching file in `raw/processed/`.
Supported formats: `.md`, `.pdf`, `.txt`

If `news/inbox/raw/` is empty or all files are already processed, report "No new articles" and stop.

## Step 2: Process each article

For each unprocessed article:

### 2a. Read the raw content

- `.md` files: read directly
- `.pdf` files: read with the Read tool (PDF support)
- `.txt` files: read directly

### 2b. Create distilled summary

Write to `news/inbox/YYYY-MM-DD-author-slug.md` following this frontmatter:

```markdown
---
title: "Article Title"
author: Author Name
date: YYYY-MM-DD
url: <original URL if found in the content, otherwise leave blank>
status: ✅ distilled
relevance: ⭐ to ⭐⭐⭐⭐⭐
---

# TL;DR

1-2 paragraph executive summary. What's the core idea, why does it matter.

## [Section per key topic]

Detailed distillation of each relevant section. Include:
- Code examples if the article has them (preserve original)
- Metrics/numbers if reported
- Architecture diagrams if described

## Reusable patterns / techniques

Numbered list of reusable patterns extracted.

## Limitations (not acknowledged but obvious)

What the article doesn't acknowledge but should.

## What we distilled to `research/`

List of what goes to insights.md and/or patterns.md.
```

### 2c. Determine relevance

Rate relevance for qa-framework / QAAP:
- ⭐ — Tangentially related, no actionable insight
- ⭐⭐ — Confirms existing decisions, no new info
- ⭐⭐⭐ — New technique or pattern worth tracking
- ⭐⭐⭐⭐ — Directly applicable, influences design decisions
- ⭐⭐⭐⭐⭐ — Unlocks blocked work or introduces paradigm-level insight

## Step 3: Update news/README.md index

Add one row per processed article to the index table, maintaining chronological order (newest first).

## Step 4: Move raw files to processed

```bash
mv news/inbox/raw/<filename> news/inbox/raw/processed/
```

## Step 5: Extract insights for research/

For each article with relevance ≥ ⭐⭐⭐:

### Cross-reference with existing research

Read `research/insights.md` and `research/patterns.md`. For each finding in the article:

1. **Already covered?** → Note which insight/pattern it reinforces. If it adds a new source, update the `Appearances:` list in `patterns.md`.
2. **New insight?** → Add to `research/insights.md` following the existing format (title, origin, what, why it matters, decision/action).
3. **Becomes a pattern?** (appears in 2+ independent sources now) → Promote from insight to `research/patterns.md`.

## Step 6: Propose framework & QAAP changes

For each new insight with relevance ≥ ⭐⭐⭐⭐:

### Analyze impact on qa-framework

Read the relevant files and identify what would change:
- `parsers/` READMEs — new parser capabilities?
- `protocol/v0.1-generation-protocol.md` — new pipeline steps?
- `STATUS.md` — items moving from "genuinely new" to "partial base"?
- `architecture/` ADRs — new decisions needed?

### Analyze impact on QAAP

Read the relevant qaap docs and identify changes:
- `documentation/llm-pipeline-spec.md` — new stages, templates?
- `documentation/connector-spec.md` — new connector methods?
- `documentation/mvp-phases.md` — new features in phases?
- `documentation/domain-model.md` — new entities?

### Present changes to user

Before applying framework/QAAP changes, present a summary:

```
## Proposed changes

### qa-framework
- [file]: [what changes and why]

### QAAP
- [file]: [what changes and why]

### research/
- insights.md: +N new insights
- patterns.md: +N new patterns, M updated

Apply all changes?
```

Wait for user confirmation before applying.

## Step 7: Sync docs

After all changes are applied, invoke the `/sync-docs` skill to ensure all READMEs and CLAUDE.md files are in sync with the new content.

## Output

Final summary to the user:

```
## Processed: N artículos

| Artículo | Relevancia | Insights nuevos | Cambios framework/QAAP |
|----------|------------|-----------------|----------------------|
| ... | ⭐⭐⭐⭐ | 2 | 3 files |

## Totales
- Insights: X existentes + Y nuevos = Z total
- Patterns: X existentes + Y nuevos = Z total
- Framework files modified: N
- QAAP files modified: N
```

## Edge cases

- **Article is mostly marketing / low-signal**: process the summary but mark as ⭐ relevance and skip steps 5-6
- **Article covers a topic already deeply covered**: update existing entries rather than creating duplicates
- **Article is behind paywall and raw is just an excerpt**: note in the summary that the article is incomplete, process what's available
- **Multiple articles on the same topic**: cross-reference them and note convergence in patterns.md
