---
title: "Test-Driven AI: Building Deterministic CI/CD Evaluations for Genkit in Go"
author: ElAmir Mansour
date: 2026-06-01
url: https://elamir.medium.com/test-driven-ai-building-deterministic-ci-cd-evaluations-for-genkit-in-go-f4d26f457e5f
status: ✅ distilled
relevance: ⭐⭐⭐
---

# TL;DR

How to put **deterministic-in-outcome** LLM evals inside the CI/CD loop using Google Genkit + Go. The thesis: move from boolean logic (`output == expected`) to **threshold-based continuous evaluation** (`score >= threshold`), with golden datasets as holdout and LLM-as-Judge scoring against a rubric. Conceptually solid, but the article is short (3 min) and the Go snippets are empty — it's more manifesto than tutorial.

> Warning: The `Go` code blocks from the raw source come without a body (`func TestCodeGenerationAgent(t *testing.T) {}`). The value is in the mental model, not in copy-paste code.

## Core idea — from the deterministic realm to the probabilistic

- The SWE lives in the deterministic: one line of code → one expected output → one unit test that verifies it.
- LLMs break the pipeline: changing a system prompt or the provider releasing a new model version shifts the agent's behavior in subtle and dangerous ways.
- Exact string matching → fragile and useless tests. The goal is **threshold-based continuous evaluation**.

## The SWE vs ML framing (citing *Building ML Powered Applications*, Ameisen)

- `software testing` checks **logic**.
- `ML validation` evaluates **behavior against a distribution** of expected outcomes.
- Bridge between both = 3 components:
  1. **Proxy metrics** to quantify quality.
  2. **Golden datasets** as holdout sets.
  3. **Automated continuous evaluation** within CI/CD.

## Genkit + LLM-as-Judge

- Genkit (Google) provides a robust way to build and **trace** AI flows.
- Instead of comparing against an exact string, a secondary LLM acts as a **judge** and scores the primary agent against a rubric: `factual accuracy`, `toxicity`, `schema compliance`.

## Concrete CI/CD gate

- Golden dataset in JSON (`input` / `context` / `expected_output`).
- Eval logic in Go runs the cases.
- Integrated into **GitHub Actions**: if `meanAccuracy` drops below the threshold, the runner interprets it as a job failure and **blocks the merge**.

## Reusable patterns / techniques

1. **Score, don't assert** — the same unlock that already appears in other articles in the inbox (Kshirsagar, Pattnaik). Strong ecosystem convergence.
2. **Golden dataset as holdout set** — ML vocabulary applied to QA, not just "test cases".
3. **Eval as merge gate** — same family as "coverage gap as PR linter" ([[2026-06-01-amrutalohabare]]). The gate lives in GitHub Actions and blocks by threshold, not by keyword.

## Limitations (not acknowledged)

- The threshold gate suffers the same problem as any non-deterministic eval: the score varies run-to-run, so a fixed threshold generates flakiness in the gate itself. No mention of trend tracking or retries.
- Genkit + Go is a niche stack; the pattern is portable but the article doesn't isolate it from the framework.
- Zero detail on how to build/version the golden dataset (the real work).

## What we distilled to `research/`

→ Reinforces already registered patterns (does not open a new axis):
- **"Score, don't assert"** now seen in 3+ independent sources → promote to consolidated pattern.
- **Eval-as-merge-gate** as a variant of "QA gate in CI" — note the flaky threshold nuance.
