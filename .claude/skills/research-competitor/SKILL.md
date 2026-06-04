---
name: research-competitor
description: Deep-research a competitor or alternative tool (Meticulous, QA Wolf, Shortest, Carbonate, Momentic, etc.), produce a structured comparison against our framework principles, and save to `references/`. Use when the user says "investiga <tool>", "research competitor", or invokes `/research-competitor <name>`.
---

# research-competitor — structured analysis of alternative QA automation tools

## When to invoke

User says any of:
- "investiga <tool-name>", "analiza <tool-name>"
- "research competitor <name>"
- "cómo se compara <tool> con nosotros"
- `/research-competitor <name>`

## Input

Name of the tool to research. Known candidates from `STATUS.md`:
- Meticulous
- QA Wolf
- Shortest
- Carbonate
- Momentic

But any QA automation tool is valid input.

## Step 1: Research the tool

Use WebSearch and WebFetch to gather:
- Official website and documentation
- Pricing model (free tier? per-seat? usage-based?)
- Technology stack (what language, what test framework, cloud/local)
- Key features and differentiators
- How it uses AI/LLM (if at all)
- Target audience (enterprise? startup? developer? QA team?)
- Known limitations (from reviews, GitHub issues, blog posts)

## Step 2: Evaluate against our principles

Score the tool against each framework principle from `CLAUDE.md`:

| Principle | Score | Evidence |
|-----------|-------|----------|
| Properties over content | ✅/⚠️/❌ | Does it assert on properties or literal text? |
| Static analysis first | ✅/⚠️/❌ | Does it use deterministic analysis where possible? |
| Build-time vs run-time separation | ✅/⚠️/❌ | Clear separation? |
| Local-first | ✅/⚠️/❌ | Can it run without cloud? Data stays local? |
| Confidence + rationale | ✅/⚠️/❌ | Does it explain its decisions? |
| Strict convention contracts | ✅/⚠️/❌ | Does it respect project conventions? |
| Observation-based debug | ✅/⚠️/❌ | How does it handle test failures? |

## Step 3: Identify what they do that we don't

For each feature the competitor has that our framework/QAAP doesn't:
- Is this a gap we should address?
- Is this something we deliberately chose not to do (and why)?
- Could this inform a new insight in `research/insights.md`?

## Step 4: Generate analysis

Write to `references/competitors/YYYY-MM-DD-<tool-name>.md`:

```markdown
---
tool: <Tool Name>
url: <official URL>
date: YYYY-MM-DD
status: ✅ analizado
---

# <Tool Name> — Competitor Analysis

## Overview
What it is, who it's for, pricing model.

## Technology
Stack, AI usage, deployment model.

## Feature Comparison

| Feature | <Tool> | qa-framework | QAAP |
|---------|--------|---------------------|------|

## Alignment with Our Principles
[Principle scorecard from Step 2]

## What They Do That We Don't
[Gaps and whether they matter]

## What We Do That They Don't
[Our differentiators]

## Takeaways for Our Roadmap
[Concrete insights, if any, to add to research/]
```

## Step 5: Update references/README.md

Add an entry to the index table in `references/README.md`.

## Step 6: Propose research updates

If the analysis reveals new insights worth capturing:
- Present them to the user
- If confirmed, add to `research/insights.md` with the competitor analysis as origin
