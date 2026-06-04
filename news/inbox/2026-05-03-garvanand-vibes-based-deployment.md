---
title: "You Don't Have a Testing Problem. You Have a Vibes-Based Deployment Problem"
author: Garvanand
date: 2026-05-03
url: https://medium.com/@garvanand03/you-dont-have-a-testing-problem-you-have-a-vibes-based-deployment-problem-2f020b096057
status: ✅ distilled
relevance: ⭐⭐⭐⭐⭐ (most conceptually important piece of the batch — defines what to evaluate in agentic systems)
---

# TL;DR

Defines the distinction **output evaluation vs. trajectory evaluation** — the reason why traditional LLM eval tools **do not work for agents**. Proposes 4 measurement axes, copyable code for a minimal evaluator, and the specific failure modes of LLM-as-Judge.

## Core thesis

> Standard LLM eval frameworks evaluate **outputs**, not **trajectories**. They measure what the model said at step 3, not whether the output of step 3 caused step 7 to fail.
>
> A single-call eval answers: *is this response good?*
> An agent eval has to answer: *did the agent pursue the right strategy, use the right tools, reason correctly at each step, and arrive at a useful outcome — across an entire multi-turn session?*

**Implication:** a failure in agentic systems typically occurs **mid-execution**, not in the final output. A wrong-tool at step 2 can produce a final response that looks plausible. Output-only eval will never catch it.

## The 4 axes to measure

| # | Axis | What it covers | Example metric |
|---|---|---|---|
| 1 | **Output quality** | final response correct, grounded, format OK | correctness, faithfulness, coherence |
| 2 | **Tool selection accuracy** | did the agent choose the right tool? | comparison against reference trajectory |
| 3 | **Step-level faithfulness** | each intermediate step is reasonable | representative sampling evaluated systematically |
| 4 | **Regression across changes** | after a prompt/retrieval/model change, do core cases still pass? | golden dataset run pre/post |

## The minimal evaluator (golden cases + deterministic checks)

Golden case structure:
```python
{
    "id": "tool_use_01",
    "input": "Search the database for Q3 revenue figures",
    "expected_tools": ["database_query"],
    "expected_behavior": "Queries database, not web search",
    "should_not_contain": ["I'm not sure", "I don't know"]
}
```

**Deterministic checks (free and sufficient for a lot):**
- forbidden phrases (`should_not_contain`)
- tool usage match (`expected_tools` vs `result["tool_calls"]`)
- format compliance

→ "A golden dataset + pre/post comparison script = **one afternoon** of setup. Enough to catch most regressions."

## LLM-as-Judge: specific failure modes

| Bias / pitfall | Mitigation |
|---|---|
| **Verbosity bias** — judges reward long responses | explicit prompt to evaluate conciseness |
| **Self-serving bias** — using same model family as judge inflated scores | use a judge from a different family |
| **Vague rubrics** ("is this good?") produce useless scores | specific observable criteria, with anchors per level |
| **Missing ground truth** | give the judge the correct answer to compare against, not open-ended scoring |

> "LLM-as-Judge is a tool, not ground truth. Validate it against human ratings on a sample before scaling."

## Reusable patterns / techniques

1. **Trajectory eval as a distinct category.** Output eval frameworks DO NOT work for agents. Default assumption to avoid.
2. **Reference trajectory per test case.** Define "which tools and in what order you would expect to see" → compare against that. It is not output match, it is path match.
3. **Deterministic evals are free and catch a lot.** Do not start with LLM-as-Judge — start with forbidden phrases + tool usage + format.
4. **Every production failure is a new golden case.** The dataset grows with operations; static is a sign of abandonment.
5. **Latency and cost are eval axes.** A response that is 30% more accurate but 4x slower and 3x more expensive is NOT an improvement for many products.

## Myths debunked

- "My 5 manual examples are my test suite" → 5 examples is not a suite, it is a comfort ritual.
- "Evals are for scale, not early stage" → 15min of eval on day 1 saves days of debugging in prod.
- "If benchmark goes up, my agent improves" → overfitting to the golden dataset is real. You need to keep adding prod failures.
- "Accuracy is enough" → for classification yes; for agents you need trajectory metrics.

## 2026 Stack (tooling references)

| Use case | Tool |
|---|---|
| Starting out / small team | DIY deterministic + Braintrust or Langfuse |
| LangChain / LangGraph | LangSmith (native) |
| Hallucination focus | Galileo |
| Production observability | Arize or Langfuse with trace logging |

## What we distilled to `research/`

→ Added to `insights.md`:
- **Trajectory eval ≠ output eval** — core of eval design for agents.
- **Reference trajectory** as test artifact.
- **Deterministic-first eval strategy** (LLM-as-Judge only when needed).
- **LLM-as-Judge failure modes** (verbosity / self-serving / vague rubric / missing GT) as checklist.

→ Added to `patterns.md`:
- "Tooling landscape converging on Langfuse/LangSmith/Arize/Galileo" — also mentioned by Singh and Kshirsagar.
- "Eval suite is a living document — every prod failure ⇒ new golden case" (pattern shared with Kshirsagar #2).
