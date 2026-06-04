---
title: "3 Agents. 12 Days. Legacy XPath → Smart Locators"
author: Rohit Kshirsagar
date: 2026-05-22
url: https://medium.com/@krohit0389/3-agents-12-days-77a7827d6b52
status: ✅ distilled
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

A system of **3 specialized agents** that cleaned up 847 fragile XPath selectors across 94 Selenium test files in 12 days, **with 0 regressions**. What matters is not the result — it's the **confidence-based routing** architecture that decides what goes through a human and what doesn't.

## The problem (psychology, not technical)

XPath debt compounds because modifying locators carries unknown risk (you don't know what else depends on the same element) → nobody touches them → debt grows → fear grows → the suite becomes untouchable.

The system **doesn't solve the selectors**. It solves the psychological problem: it makes the risk of refactoring lower than the risk of not refactoring.

## Architecture: 3 specialized agents

### Agent 1 — The Archaeologist (audit)

Static analysis pass. Classifies each `By.*` locator into 4 risk tiers:

| Tier | Criteria | Action |
|---|---|---|
| Red Critical | Positional XPath (`//div[3]/span[1]`), auto-generated framework IDs (`ember-*`, `ng-*`) | Fix immediately |
| Orange High | CSS class chains > 2, `@class` XPath, hardcoded indices | Fix this sprint |
| Yellow Medium | XPath `text()` / `contains()` against stable text | Schedule next sprint |
| Green Safe | Stable `By.id()`, `By.name()`, `By.linkText()` | Don't touch |

Output: JSON backlog with file/line, current selector, tier, test criticality, fix complexity.

> "Transforms 'we have 847 XPaths to fix' into '312 Critical+High, here are the 47 in the highest-value flows, in this order'."

### Agent 2 — The Refactor Engine (replace)

For each High/Critical locator:
1. Headless browser probe against staging → captures DOM subtree.
2. Sends to Claude Sonnet with a structured prompt and **explicit priority list**:
   ```
   1. By.id()           if a stable id exists
   2. By.cssSelector([data-testid='...'])
   3. By.name()
   4. By.cssSelector([aria-label='...'])
   5. By.linkText()
   6. By.xpath()        only if no stable alternative exists
   ```
3. Returns recommended locator + **confidence score 0-100** + rationale.

**Routing by confidence (the key pattern):**

| Confidence | Action | % in their run |
|---|---|---|
| >= 85% | Auto-replacement, change logged, queued for Validator | 68% |
| 60-84% | Engineer review (one-click approve / override) | 24% |
| < 60% | Manual with context notes (frequently: "frontend needs to add `data-testid`") | 8% |

### Agent 3 — The Validator (safety net)

Runs **both versions** (original + refactored) against the same staging environment. Any test that changes pass/fail triggers a diff report with DOM state + assigned confidence score.

In 12 days, it caught **4 cases** where the high-confidence replacement was technically valid but **behaviorally wrong** (correct selector for the element type, wrong instance).

> "Zero regressions shipped. Not because the agents were perfect. Because the validation layer caught imperfection before it reached main."

## Reusable patterns / techniques

1. **Confidence-based human-in-the-loop routing.** The agent labels its own uncertainty; humans review only the ambiguous range.
2. **Validation by parallel execution.** Running original and refactored in parallel is the only real guarantee of "zero regression".
3. **Explicit priority list in the prompt** (not "find best locator", but a numbered list). The model doesn't invent strategy; it executes policy.
4. **Static analysis + LLM in pipeline.** The Archaeologist doesn't use LLM (deterministic classification); the LLM only enters when there is real ambiguity.

## Acknowledged limitations

- 8% manual required cross-team frontend changes (adding `data-testid` to 23 components) — 3 days of scheduling + 4h of implementation.
- Validator doubles CI runtime during the refactor window (~35min additional per run on 94 files).
- Confidence calibration is tied to Selenium standard API; Shadow DOM / Web Components → systematically lower scores and more manual work.

## What we distilled to `research/`

→ Added to `insights.md`:
- **Confidence-based routing** as a key tactical pattern.
- **Static analysis + LLM fallback** (not LLM-everywhere): determinism where possible, LLM where there is ambiguity.
- **Validation by parallel execution** as the only real guarantee.

→ Reinforces pattern in `patterns.md`:
- "Decomposition into 3 layers/agents" — second data point (alongside 3-pipelines from the same author).
