---
title: "3 Pipelines. 14 Days. 0 → 500 AI Test Assertions: Building LLM QA Automation from Scratch"
author: Rohit Kshirsagar
date: 2026-05-08
url: https://medium.com/@krohit0389/3-pipelines-14-days-0-500-ai-test-assertions-building-llm-qa-automation-from-scratch-9853f219663a
status: ✅ distilled
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

Architecture of **3 sequenced pipelines** that took an LLM feature from zero to 500 assertions in CI in 14 days. The conceptual unlock: **stop asserting on content and start asserting on properties**.

## Core thesis

> LLM outputs are non-deterministic in their exact phrasing. **They are not non-deterministic in their properties.** A well-grounded response in its context is always grounded when a good prompt is used. A response that drifts from a validated baseline is detectable as drift even if the wording differs.

## Architecture (3 layers, each deliverable independently)

| # | Pipeline | What it asserts | Tooling | Days | Assertions |
|---|---|---|---|---|---|
| 1 | **Structural** | output != null, length, valid JSON, absence of refusal phrases, presence of query entity | pytest + fixtures | 1-4 | 180 |
| 2 | **Semantic** | answer relevancy, faithfulness (RAG anti-hallucination), contextual recall, coherence | DeepEval (judge model) | 5-10 | 200 |
| 3 | **Regression** | semantic similarity vs. approved baseline (threshold 0.78) | Custom + versioned JSON baseline in repo | 11-14 | 120 |

**Total CI added:** 18min in parallel jobs + 4min in sequential structural.

## Reusable patterns / techniques

1. **Sequenced layered investment.** Each pipeline delivers value on its own; no big-bang. CI signal on day 3, not day 14.
2. **Structural assertions are undervalued.** "Presence of query entity in the response" = relevance proxy without a semantic model.
3. **Baseline regression with commit history as audit trail.** Baseline update = 1 CLI command; the JSON diff is the history of intentional behavior changes.
4. **Severity matches block-severity.** Semantic pipeline (depends on external judge model) → generates warning, does not block merge. Structural + regression block.
5. **Circuit breaker** for external dependencies (judge model provider down).

## Limitations acknowledged

- 500 assertions ≠ 500 scenarios. They are 120 unique queries × 3 layers (= same queries evaluated on different axes).
- Threshold 0.78 required **2 days of tuning** against historical data — calibration is not optional, and it will change with each model migration.
- Building the dataset of 120 queries with well-defined expected outputs = **3 days of focused work**. Not shortcut-able.

## What we distilled to `research/`

→ Added to `insights.md`:
- **Properties-over-content** as conceptual unlock.
- **Sequenced layered architecture** as roadmap criterion (no big-bang).
- **Severity matches block-severity** as CI design principle.

→ Added to `patterns.md`:
- "Decomposition into 3 layers/agents" as meta-pattern (this post + 3-agents XPath + RAG test automation).
