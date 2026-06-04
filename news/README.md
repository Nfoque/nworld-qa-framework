# News — QA Automation + LLMs

Collection of news, articles, posts, papers, and publications related to
test automation using LLMs.

## RSS Sources

Verified RSS feeds live in [`feeds.md`](feeds.md). The Top 3 are the
Medium tag feeds (`ai-testing`, `llm-testing`, `test-automation`).

## Paywalled Articles (Medium member-only)

The assistant **cannot authenticate** with your Medium account. RSS only returns excerpts.
To read the full body of a member-only post, see [`paywall-workflow.md`](paywall-workflow.md) —
the recommended flow is **MarkDownload + drop in `inbox/raw/`**.

## How to add an article

1. Save the article (or a summary + link) in `inbox/` named `YYYY-MM-DD-slug.md`.
2. Add an entry to the index table below.
3. Once distilled to `research/`, mark as ✅ distilled.

## Index

| Date | Title | Source | Status | Notes |
|---|---|---|---|---|
| 2026-06-01 | [Test-Driven AI: Deterministic CI/CD Evaluations for Genkit in Go](inbox/2026-06-01-elamir-genkit-go-deterministic-evals.md) | Medium (ElAmir Mansour) | ✅ distilled | "Score, don't assert" + eval-as-merge-gate in GitHub Actions. Reinforces, doesn't open new axis. |
| 2026-04-23 | [MCP + Playwright + Jira: How I Automated My Entire QA Workflow End-to-End](inbox/2026-04-23-nesvitii-mcp-playwright-jira-e2e-automation.md) | Medium (Mykola Nesvitii) | ✅ distilled | **Full ticket-to-PR pipeline without human touch.** Strict AGENTS.md (~95% compliance), normalisation step, DOM-grounded generation, observation-based debug loop. High impact: unblocked Jira parser, validation loop, connector write-back. |
| 2026-06-01 | [How I Built a pytest Framework to Test LLMs on Red Hat OpenShift AI](inbox/2026-06-01-pattnaik-pytest-llm-openshift.md) | Medium (alaka_pattnaik) | ✅ distilled | **Negative-retrieval (fake-fact injection)** + Layer 0 serving + custom judge model (DeepEval↔OpenAI gotcha). |
| 2026-06-01 | [Using AI to Find Coverage Gaps in Your Playwright Test Suite](inbox/2026-06-01-amrutalohabare-ai-coverage-gaps-playwright.md) | Medium (Amrutalohabare) | ✅ distilled | "Coverage gap analysis as PR linter" pattern + concrete GitHub Action. |
| 2026-05-30 | [How RAG is Transforming Test Automation](inbox/2026-05-30-singh-rag-test-automation.md) | Medium (Sanjay Singh) | ✅ distilled | Conceptual map: RAG for failure analysis + classification taxonomy + duplicate detection. |
| 2026-05-25 | [Why QA Engineers Should Learn Playwright MCP](inbox/2026-05-25-sanaev-playwright-mcp.md) | Medium (Muhammad Sanaev) | ✅ distilled | Clarifies "MCP = build-time inspector, not run-time runner". Reinforces regression/exploratory separation. |
| 2026-05-22 | [3 Agents. 12 Days. Legacy XPath → Smart Locators](inbox/2026-05-22-kshirsagar-three-agents-xpath-refactor.md) | Medium (Rohit Kshirsagar) | ✅ distilled | 3-agent architecture (Archaeologist/Refactor/Validator) + confidence-based routing. |
| 2026-05-08 | [3 Pipelines. 14 Days. 0 → 500 AI Test Assertions](inbox/2026-05-08-kshirsagar-three-pipelines-500-assertions.md) | Medium (Rohit Kshirsagar) | ✅ distilled | **Conceptual unlock: properties over content.** 3-layer architecture: structural/semantic/regression. |
| 2026-05-05 | [4 Metrics. 1 Week. PromptFoo Setup for SDETs](inbox/2026-05-05-kshirsagar-promptfoo-rag-validation.md) | Medium (Rohit Kshirsagar) | ✅ distilled | PromptFoo + 4 metrics. Ground-truth dataset construction from 3 sources. |
| 2026-05-03 | [You Don't Have a Testing Problem. You Have a Vibes-Based Deployment Problem](inbox/2026-05-03-garvanand-vibes-based-deployment.md) | Medium (Garvanand) | ✅ distilled | **Trajectory eval ≠ output eval.** 4 measurement axes for agents. LLM-as-Judge failure modes. |
| 2026-05-03 | [Your AI Test Pipeline Does Not Need the Cloud](inbox/2026-05-03-kshirsagar-local-llm-pipeline.md) | Medium (Rohit Kshirsagar) | ✅ distilled | Local-first with Ollama + LM Studio. OpenAI-compatible API as portability layer. |
| 2026-02-23 | [I replaced my entire QA team with Claude and Agentic Workflow](inbox/2026-02-23-kastner-replaced-qa-team-with-claude.md) | Medium · Level Up Coding (Brent Kastner) | ✅ distilled | Postmortem from the author of `references/ai-qa-framework/`. Regression-vs-exploratory thesis. |
| 2022-01-01 | [Testing Automation, What are Pyramids and Diamonds?](inbox/2022-01-01-kapoor-pyramids-diamonds.md) | Medium (Ritesh Kapoor) | ✅ distilled | Non-LLM conceptual anchor: pyramid/inverted/diamond. Base that the "AI Testing Pyramid rewritten" takes as rewritten. |

**Status legend:** 🔲 new · 🔍 under review · ✅ distilled to `research/` · ❌ discarded

## Topics we track

- LLM agents for test generation (unit, integration, E2E)
- LLM output evaluation frameworks (LLM-as-a-judge, golden sets)
- Test generation from specs / requirements
- Self-healing tests
- Visual regression with vision models
- Tool use / MCP servers for QA
- Enterprise use cases (post-mortems, engineering blog posts)
