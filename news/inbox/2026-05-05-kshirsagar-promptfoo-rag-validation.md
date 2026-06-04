---
title: "4 Metrics. 1 Week. Blind Testing → Full RAG Validation: PromptFoo Setup for SDETs"
author: Rohit Kshirsagar
date: 2026-05-05
url: https://medium.com/@krohit0389/4-metrics-1-week-blind-testing-full-rag-validation-promptfoo-setup-for-sdets-f87b8211eb8a
status: ✅ distilled
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

**PromptFoo** setup in one week with 4 metrics that uncovered **14 prompt variants that manual review had approved**. The framework is YAML-first + Git-native + CI-native.

## Core thesis

> The most dangerous type of confidence is not uncertainty — it is confidence after a manual testing session that "went well". For LLMs that is liability, not validation. LLMs do not fail by throwing exceptions: they fail by being confidently incorrect, subtly off-topic, inconsistent across equivalent inputs, or toxic in edge cases.

## Why PromptFoo (vs. DeepEval / RAGAS)

| Criterion | PromptFoo | DeepEval |
|---|---|---|
| Config | YAML in Git, reviewable in PR | Python-native, more flexible |
| Side-by-side prompt comparison | Native | Via custom code |
| CI integration | 4 lines in GitHub Actions | More setup |
| RAG-specific metrics (retrieval precision/recall) | Limited | More complete |

**Combinable:** PromptFoo (fast CI + variant comparison) + DeepEval/RAGAS (deep retrieval analysis). They are not mutually exclusive.

## The 4 metrics (chosen to cover real failure modes)

| Metric | Threshold | What it covers |
|---|---|---|
| **Answer correctness** | 0.85 | semantic similarity vs. expected output |
| **Context adherence** | 0.80 | hallucination detector for RAG: each claim must be grounded in retrieved context |
| **Toxicity** | pass/fail | adversarial prompts, high asymmetric downside |
| **Response consistency** | 0.80 | two rephrasings of the same question produce equivalent answers |

## Ground-truth dataset — 3 sources (2 days of work)

1. **Production query logs** (90 queries) — categorized by intent, representatively sampled.
2. **Adversarial prompts** — known failure modes, out-of-scope queries, ambiguities.
3. **Regression cases** — bugs that reached prod in the last quarter.

Expected output ≠ exact string. Criteria: "must acknowledge X", "must not claim Y", "must cite source Z".

## Critical finding from the first run

| Metric | Production prompt | Revised prompt (with explicit grounding instructions) |
|---|---|---|
| Context adherence | 0.73 ❌ | **0.89** ✅ (+16 points) |

→ Data drove a decision that otherwise would have been a subjective product vs. eng debate.

## Reusable patterns / techniques

1. **Eval the full pipeline, not the model in isolation.** PromptFoo targets the RAG pipeline endpoint, not the model directly.
2. **Head-to-head variant comparison as decision mechanism.** Three system prompt variants run in a single pass.
3. **Per-metric threshold, not global.** Each axis has its own threshold because each has its own natural distribution.

## Limitations acknowledged

- 120 cases ≠ long tail coverage. Dataset is a living document, it needs to be rebaselined with every significant model/retrieval change.
- Semantic similarity is sensitive to the quality of expected outputs. Garbage in → garbage out applies to the eval as much as to the model.

## What we distilled to `research/`

→ Added to `insights.md`:
- **PromptFoo + DeepEval/RAGAS** as combinable stack (not exclusive).
- **Eval the pipeline, not the model.** Test the full system endpoint.
- **Per-metric thresholds, not global.** Each axis has its own distribution.
- **Variant comparison as decision mechanism.** Turns subjective debates into data.

→ Reinforces pattern in `patterns.md`:
- "Golden dataset / ground truth" as mandatory investment, not shortcut-able.
