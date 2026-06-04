---
title: "Using AI to Find Coverage Gaps in Your Playwright Test Suite"
author: Amrutalohabare
date: 2026-06-01
url: https://medium.com/@amrutalohabare/using-ai-to-find-coverage-gaps-in-your-playwright-test-suite-7b2e590f8ab9
status: ✅ distilled
relevance: ⭐⭐⭐⭐
---

# TL;DR

4 workflows with copy-paste prompts to use Claude as a coverage auditor on a Playwright suite. Workflow #4 is the most valuable: **automate gap checking on every PR via GitHub Actions + Claude API**.

> Warning: The raw markdown of the article is incomplete in `processed/` — the beginning is missing. What appears corresponds to workflows 1, 3, and 4 (workflow 2 is also missing). Processed with what was available.

## Workflow 1 — Find missing scenarios from user story

Prompt template:
```
You are a senior QA engineer reviewing test coverage for a Playwright Python test suite.

User story: [paste]
Acceptance criteria: [paste]
Existing tests: [paste]

Review the tests against acceptance criteria and:
1. List scenarios from AC NOT covered
2. List edge cases and boundary conditions not covered
3. Rate overall coverage as Low/Medium/High with reason
```

**Real case reported:** ran this on checkout tests. AC had 8 points, tests covered 6. Claude detected in <10s:
- No test for applying expired discount code
- No test for checkout when saved card is expired

## Workflow 3 — Traceability without a dedicated tool

Maps user stories → test functions automatically. Example output:
```
US-04 (Remember me functionality) → ❌ NO TEST FOUND
US-05 (Password reset flow) → ❌ NO TEST FOUND
```

This is a lightweight traceability matrix that typically requires a tool (Xray, Zephyr) or a manual spreadsheet.

## Workflow 4 — Automate on every PR (the power move)

GitHub Action that on every PR to `tests/**` runs a Python script that:
1. Reads all test files from `tests/`.
2. Sends the collection to Claude Sonnet 4 (`claude-sonnet-4-20250514`).
3. Asks for HIGH risk gaps, maximum 5.
4. **Fails the build if the response contains "high"**.

Full workflow YAML + Python script are in the article (see raw in `processed/`).

## Reusable patterns / techniques

1. **Coverage gap analysis as a PR linter.** Same mental model as ESLint/typecheck — runs automatically, blocks merge if flagged.
2. **Constrain output** ("maximum 5 items", "be concise", "format as bullet list") — reduces noise and token cost.
3. **Gate by keyword in response** (`if "high" in gaps.lower()`) — dead simple and sufficient to start.

## Limitations (not acknowledged but obvious)

- Sending **all** test files in a single prompt doesn't scale — finite context window + growing cost.
- Gate by keyword is fragile: the model can say "no high-risk gaps detected" and block the build. Needs structured output (JSON with `risk_level` field).
- No caching or baseline — every PR re-evaluates the entire suite even if the core logic didn't change.

## What we distilled to `research/`

→ Added to `insights.md`:
- **Coverage gap analysis as PR linter** — replicable pattern.
- **Output constraints in prompt** (max items, format) as a cost/noise control technique.
- **Structured output mandatory** for gating decisions (not keyword matching).
