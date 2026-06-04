---
title: "How I Built a pytest Framework to Test LLMs on Red Hat OpenShift AI"
author: alaka_pattnaik
date: 2026-06-01
url: https://medium.com/@alakap2026/title-how-i-built-a-pytest-framework-to-test-llms-on-red-hat-openshift-ai-and-what-i-learned-c94315f72fad
status: ✅ distilled
relevance: ⭐⭐⭐⭐
---

# TL;DR

Practical case of an open-source framework (`agenteval-platform`, pytest) with **3 layers of AI testing**: (1) model serving API, (2) LLM output quality via judge model, (3) RAG pipeline. Same 3-layer model we already saw in Kshirsagar ([[2026-05-08-kshirsagar-three-pipelines-500-assertions]]), but here the novelty is the **infra (serving) layer** and a brilliant RAG test: inject a fake fact into the vector store and assert that the model uses it. 100% open source stack / $0 cost. (Note: the article is partly job-search self-promotion.)

## 3-layer architecture

**Layer 1 — Model Serving API Tests** (the foundation: reliability before quality)
- Validates: HTTP 200 from inference endpoints, latency within SLA, valid JSON schema, edge cases (empty prompts, special characters, long inputs, concurrent requests).
- Stack: `pytest + httpx + Ollama (llama3.2 local)`. Runs in <10s.

**Layer 2 — LLM Output Quality Tests** (where traditional QA ends and AI QE begins)
- Judge model = Groq `llama-3.3-70b-versatile` scores the local model on 3 dimensions:
  - **Hallucination** — did it invent facts outside the context?
  - **Faithfulness** — did it stay within what was retrieved?
  - **Relevancy** — is the response useful for the question?
- **Key gotcha:** started with **DeepEval** but it has a **hard OpenAI dependency** that cannot be overridden. Replaced it with a custom judge function using Groq → full control of the rubric + zero cost.

**Layer 3 — RAG Pipeline Tests**
- RAG agent: `LangChain LCEL` + `ChromaDB` + `nomic-embed-text` (embeddings) + `Ollama llama3.2`.
- Tests: does the retriever return relevant docs? Does the response contain keywords from the retrieved context? Does it answer from retrieval and not from memory? Does it say "I don't know" for out-of-context questions?
- **The most ingenious test:** inject a fake fact into the vector store (`"the secret deployment colour is ULTRAVIOLET"`) and assert that the model uses it. If it uses it → retrieval works. If it gives the real answer from training memory → **the RAG pipeline is broken.**

## Local-to-production portability

- Protocol abstraction layer: the **same pytest tests** run against local Ollama (dev) and KServe endpoints (prod on OpenShift AI).
- Switching environments = one line in `test_config.yaml` (`environment: "local" → "openshift"`).
- Validated against a real cluster (Red Hat Developer Sandbox): ModelMesh + OpenVINO + ONNX model, KServe V2 protocol.

## 5 AI QE lessons (from the author)

1. **Score, don't assert** — `assert score >= threshold`, not `== expected`.
2. **You need a judge model** — humans don't scale, rules lose nuance, LLM-as-judge is fast/consistent.
3. **Test the pipeline, not just the model** — 60% of real failures happen at the pipeline level (poorly retrieved docs, context window overflow, prompt template bugs).
4. **Non-determinism is a feature** — same code can pass or fail; it's not flakiness, it's the model varying. Track **score trend**, not individual pass/fail.
5. **Classic QE skills matter more** — the AI engineer knows models; the QE knows failure modes. The intersection is where the value lies.

## Stack (all open source, $0)

`pytest + httpx` · `Ollama` (llama3.2) · `Groq` (judge, free tier) · `LangChain` (RAG) · `ChromaDB` · `nomic-embed-text` · `GitHub Actions` · `Allure` (reporting).
Results: 36 tests / 4 layers / 100% pass / 2 environments. Repo: github.com/alakapatnaik/agenteval-platform

## Reusable patterns / techniques

1. **Negative-retrieval test (fake fact injection)** — the most reusable technique from the article: plant a fact that is NOT in training and verify it comes out via retrieval. Distinguishes "RAG works" from "the model knew it anyway". **New, was not in research.**
2. **Serving/infra as Layer 0** — test 200/latency/schema *before* quality. The other articles in the inbox jump straight to quality; this adds the foundation.
3. **Protocol abstraction (local-to-prod with 1 line)** — same test set, two environments. Portability pattern aligned with "local-first" ([[2026-05-03-kshirsagar-local-llm-pipeline]]).
4. **Beware of OpenAI lock-in in eval tooling** — DeepEval forced OpenAI; a custom judge gives control of rubric and cost. Practical gotcha for tool selection.

## Limitations

- 100% pass rate + job-search self-promotion → read with skepticism; there are no cases where the framework found a real bug in production.
- "Track score trend" is stated but not implemented (no baseline/history in the described repo).
- The judge (Groq free tier) introduces an external dependency that partially contradicts the "all local" claim.

## What we distilled to `research/`

→ New axis + reinforcements:
- **Negative-retrieval / fake-fact injection** as a RAG validation technique → add to `patterns.md`.
- **Serving Layer 0** (200/latency/schema before quality) → completes the 3-layer model into 4.
- Reinforces **judge model** and **score-don't-assert** (convergence with elamir and Kshirsagar).
