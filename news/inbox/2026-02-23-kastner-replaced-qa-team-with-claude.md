---
title: "I replaced my entire QA team with Claude and Agentic Workflow"
author: Brent Kastner
publication: Level Up Coding (Medium)
published: 2026-02-23
url: https://medium.com/@brentkastner/...
related_repo: references/ai-qa-framework/  # ⚠️ this is the same project, not a separate reference
status: 🔍 under review
relevance: ⭐⭐⭐⭐⭐ (very high — describes the motivation and limits of the repo we already have)
---

# Summary

Honest postmortem by Brent Kastner about `ai-qa-framework`, his open-source experiment of fully autonomous QA with Claude Opus 4.6 + Playwright + Python. The author's own conclusion: **"kind of works"**, useful for exploration but not for regression, and the QA team "is back on Monday".

## Core thesis

The key distinction the author extracts from the experiment:

> **Regression testing demands determinism. Exploratory testing is inherently non-deterministic. LLMs fit the second, not the first.**

Pretending that an LLM gatekeeps a CI/CD pipeline is premature because flakiness is structural, not a bug to fix.

## Experiment architecture

- **Minimal input:** URL + optional credentials + some hints.
- **Pipeline:** crawl → link/CTA/relation extraction → test plan generation → execution with Playwright → report.
- **Model:** Claude Opus 4.6 (Sonnet breaks structured JSON reliability — explicit technical note from the author).
- **Volume:** ~300s to generate a plan of 50 tests with steps + assertion criteria.

## Reusable patterns (high value)

1. **AI Fallback in assertions.** If Playwright cannot find the expected selector, it escalates to the LLM with the page state to emit a judgment. Works "surprisingly well".
2. **Testing types combinable by config.** Functional / visual / light security mixed in a single run.
3. **Prompt logging.** Every prompt + response is stored in `.qa-framework/` — mandatory transparency when building on something unpredictable.
4. **Visual reports with per-step evidence.** Playwright captures each step with its condition and evidence.

## Honest limitations (acknowledged by the author)

- **Structural flakiness.** Even with abundant hints, there is drift in which tests are chosen. Unacceptable for release gates.
- **Speed.** Fast compared to a human writing, slow compared to an already-written suite.
- **Does not replace the engineer.** Human value lies in: architectural decisions, pattern enforcement, judgment about which test is meaningful vs. superficial, detecting "confidently producing slop".

## Hybrid model proposal (the author's)

```
LLM ─► exploration / test discovery
            │
            ▼
   Human curator ─► flag "core flow" tests
            │
            ▼
   Deterministic regression suite ◄── runs identically every time
```

The LLM does not write the regression suite: it *proposes* it. The human decides what gets in.

## What can be distilled to `research/`

→ Pending addition as insights:
1. Regression-vs-exploratory as a design criterion (not as an implementation detail).
2. AI Fallback as a tactical pattern for fragile assertions.
3. Prompt logging as a non-functional requirement from day 1.
4. Model lock-in: the framework depends on Opus for structured output reliability — this implies that **model version is part of the contract**, not an interchangeable parameter.

## What we do NOT buy

- The title premise ("I replaced my entire QA team") is designed as clickbait — the author himself dismantles it at the end ("they are all rejoining the team on Monday"). It should not influence how we name or sell `qa-framework`.
- The idea that an autonomous LLM covers "exploration" has a low ceiling if the organization does not prioritize exploratory testing (the author himself admits no product team does it seriously).

## Link with the repo

The code lives in `references/ai-qa-framework/`. When we study its architecture, this article is the **author's mental map** of why he made each decision. Reading them separately loses half the value.

## Actions

- [ ] Audit `references/ai-qa-framework/src/` with this thesis in mind: where is the boundary between exploration and regression in the code?
- [ ] Capture the 4 distilled insights in `research/insights.md`.
- [ ] Decide whether `qa-framework` positions itself as "exploration + human-curated regression" or as something else.
