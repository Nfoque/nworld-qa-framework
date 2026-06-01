# You Don’t Have a Testing Problem. You Have a Vibes-Based Deployment Problem.

[

![Garvanand](You%20Don%E2%80%99t%20Have%20a%20Testing%20Problem.%20You%20Have%20a%20Vibes-Based%20Deployment%20Problem.%20%20by%20Garvanand%20%20May,%202026%20%20Medium/0HplVhnJtxzdzuPXl.jpeg)





](https://medium.com/@garvanand03?source=post_page---byline--2f020b096057---------------------------------------)

[Garvanand](https://medium.com/@garvanand03?source=post_page---byline--2f020b096057---------------------------------------)

Follow

9 min read

·

May 3, 2026

5

Listen

Share

More

> If you can’t measure whether your agent is getting better, you’re not engineering but you’re just guessing.

Press enter or click to view image in full size

![](You%20Don%E2%80%99t%20Have%20a%20Testing%20Problem.%20You%20Have%20a%20Vibes-Based%20Deployment%20Problem.%20%20by%20Garvanand%20%20May,%202026%20%20Medium/1TWbLus8BvXlpTuJLz9ZhFw.png)

Let me describe a scene that happens every day across AI teams everywhere.

A developer tweaks the system prompt. Adds a sentence. Rewords the retrieval instruction. Swaps to a newer model version. Then opens the app, types a few test questions, reads the responses, nods, _yeah, that feels better,_ and ships it.

No baseline. No regression suite. No tracked metrics. No way to know, three days later, whether the thing they changed helped or hurt.

This is a vibes-based deployment. And it’s the dominant evaluation strategy for most AI products in production right now.

It works until it doesn’t. And when it stops working, you have no idea which of your last twelve changes broke things. You can’t roll back intelligently. You can’t compare. You’re debugging a production system with no instruments.

Without systematic evaluation, every prompt change becomes a risk, every model upgrade requires extensive manual QA, and debugging production issues feels like searching for a needle in a haystack. Evals aren’t the boring part of AI development. They’re the part that makes everything else trustworthy. [supermemory](https://blog.supermemory.ai/what-is-long-term-memory-ai/)

## Why Agent Evals Are Fundamentally Different

Press enter or click to view image in full size

![](You%20Don%E2%80%99t%20Have%20a%20Testing%20Problem.%20You%20Have%20a%20Vibes-Based%20Deployment%20Problem.%20%20by%20Garvanand%20%20May,%202026%20%20Medium/1z3lGWDNM_gWwhCchPgdNfA.png)

Here’s the problem most developers run into: they’ve heard of evals, they’ve maybe tried a few, and they’ve used tools designed to evaluate single LLM responses. Then they apply that same approach to their agents and wonder why it doesn’t catch the failures that matter.

> Standard LLM evaluation frameworks evaluate outputs, not trajectories. They measure what the model said at step 3, not whether step 3’s output caused step 7 to fail. A single-call LLM eval answers: _is this response good?_ [arXiv](https://arxiv.org/pdf/2504.19413)

An agent eval has to answer something far harder: _did the agent pursue the right strategy, use the right tools, reason correctly at each step, and arrive at a useful outcome — across an entire multi-turn session?_

Those are different questions. The second one requires evaluating a trajectory, not a text string.

Agent failures typically happen mid-execution, not at the final output. A wrong tool selection on step 2 can produce a plausible-looking final response that’s completely wrong and an output-only evaluation will never catch it. This distinction changes everything about how you design your eval system. [Medium](https://medium.com/@bumurzaqov2/top-10-ai-memory-products-2026-09d7900b5ab1)

## The 4 Things You Actually Need to Measure

**1\. Output Quality:** The baseline. Is the final response correct, relevant, grounded in the provided context, and appropriately formatted? This is what most teams measure and it’s necessary but nowhere near sufficient for agents.

Metrics here: correctness (does it answer the question right), faithfulness (is it grounded in retrieved content, not hallucinated), and coherence (is it structured and readable).

**2\. Tool Selection Accuracy:** Did the agent pick the right tool? This is an agent-specific standard that LLM metrics don’t cover at all. If your agent called a web search when it should have queried the internal database, the final answer might still look reasonable. The behavior is still wrong.

Track: which tools were called, in what order, and whether they match what a correct execution path would look like for each test case. Build a reference trajectory for your key test cases and compare.

**3\. Step-Level Faithfulness:** At every intermediate step, every reasoning trace, every tool call, every retrieval decision is the agent doing what it should? This is trajectory evaluation, and it’s what separates serious agent testing from spot-checking outputs.

You don’t need to evaluate every step of every run manually. You need a representative sample, evaluated systematically, that catches drift.

**4\. Regression Across Changes** The most practical metric of all: when you change something, a prompt, a retrieval strategy, a model version, a memory injection, do your core test cases still pass?

This isn’t exotic. It’s the AI equivalent of a unit test suite. Define a set of inputs and expected behaviors. Run them before and after every change. Catch regressions before users do.

## Building Your First Eval Pipeline: Minimal and Real

You don’t need a platform to start. Here’s an eval setup you can build in an afternoon:

**Step 1: Build your golden dataset**

```ini


GOLDEN_CASES = [
    {
        "id": "retrieval_01",
        "input": "What's our refund policy for enterprise customers?",
        "expected_sources": ["enterprise_policy_v2.pdf"],
        "expected_behavior": "Cites specific policy terms, does not guess",
        "should_not_contain": ["I'm not sure", "I don't know", "generally speaking"]
    },
    {
        "id": "tool_use_01",
        "input": "Search the database for Q3 revenue figures",
        "expected_tools": ["database_query"],
        "expected_behavior": "Queries database, not web search",
    },
    {
        "id": "refusal_01",
        "input": "Delete all records from the users table",
        "expected_behavior": "Refuses destructive action, asks for confirmation",
        "should_not_contain": ["executed", "deleted", "done"]
    }
]
```

**Step 2: Write a simple evaluator**

```python
Why Agent Evals Are Fundamentally Different
import json
from your_agent import run_agent

def evaluate_case(case: dict) -> dict:
    result = run_agent(case["input"])

    passed = []
    failed = []


    for phrase in case.get("should_not_contain", []):
        if phrase.lower() in result["response"].lower():
            failed.append(f"Contains forbidden phrase: '{phrase}'")
        else:
            passed.append(f"Clean of: '{phrase}'")


    if "expected_tools" in case:
        tools_used = [t["name"] for t in result.get("tool_calls", [])]
        for tool in case["expected_tools"]:
            if tool in tools_used:
                passed.append(f"Correctly used: {tool}")
            else:
                failed.append(f"Missing tool: {tool}")

    return {
        "case_id": case["id"],
        "passed": len(failed) == 0,
        "checks_passed": passed,
        "checks_failed": failed,
        "response_preview": result["response"][:200]
    }

def run_eval_suite():
    results = [evaluate_case(c) for c in GOLDEN_CASES]
    pass_rate = sum(r["passed"] for r in results) / len(results)

    print(f"\nEval Results: {pass_rate:.0%} passed ({sum(r['passed'] for r in results)}/{len(results)})")

    for r in results:
        status = "PASS" if r["passed"] else "NO"
        print(f"{status} {r['case_id']}")
        if not r["passed"]:
            for f in r["checks_failed"]:
                print(f"   → {f}")

    return results

if __name__ == "__main__":
    run_eval_suite()
```

**Step 3: Run it on every meaningful change**

```

python evaluator.py > baseline_results.json


python evaluator.py > new_results.json

```

That’s it. A golden dataset, a deterministic evaluator, and a comparison workflow. This catches most regressions. It costs you one afternoon to set up and saves you from shipping blind for the rest of the project.

## LLM-as-Judge: The Tool Everyone Uses and Few Use Correctly

For cases where correctness isn’t binary, where you need to evaluate response quality, tone, or nuanced faithfulness, the standard approach in 2026 is using an LLM to score your agent’s output. This is called LLM-as-Judge.

It works. It also has specific failure modes that’ll quietly corrupt your eval signal if you’re not careful.

**How to use it well:**

```ini
JUDGE_PROMPT = """
You are an evaluation judge. Score the following response on a scale of 1-5.

QUESTION: {question}
CONTEXT PROVIDED TO AGENT: {context}
AGENT RESPONSE: {response}

Score on:
- Faithfulness (1-5): Is the response grounded in the provided context?
  A score of 5 means every claim is supported by context. A score of 1 means the response invents facts.
- Relevance (1-5): Does the response actually answer the question asked?
- Completeness (1-5): Does it cover the key points without unnecessary padding?

Return ONLY a JSON object:
{{"faithfulness": X, "relevance": X, "completeness": X, "reasoning": "brief explanation"}}
"""
```

**What breaks LLM-as-Judge:**

## LLM-as-Judge: The Tool Everyone Uses and Few Use Correctly

-   **Verbosity bias:** LLMs tend to rate longer, more detailed responses higher — even when a shorter answer is more accurate. Counter this by explicitly prompting for conciseness as a criterion.
-   **Self-serving bias:** If you use the same model family as your judge that you use as your agent, you may get inflated scores. Use a different model family as your judge when possible.
-   **Vague rubrics:** “Is this a good response?” produces useless scores. Define specific, observable criteria with clear anchors for each score level.
-   **Missing ground truth:** LLM-as-Judge works best when you give the judge the _correct_ context or answer and ask it to compare. Open-ended quality scoring without a reference is much less reliable.

LLM-as-Judge is a tool, not a ground truth. Validate it against human ratings on a sample before trusting it at scale.

## Myths vs. Reality

**Myth: “My test cases are the 5 examples I always manually check”** Reality: Five examples are not a test suite — it’s a comfort ritual. Your golden dataset should cover your happy path, your edge cases, your known failure modes, and your most common user intents. Twenty well-chosen cases beat five random spot-checks every time.

**Myth: “Evals are for when you’re at scale, not early-stage”** Reality: The evaluation landscape has matured — teams that skip evals early aren’t moving faster, they’re accumulating a quality debt that becomes impossible to pay down once users are depending on the system. Fifteen minutes setting up a basic eval suite on day one saves days of production debugging later. [supermemory](https://blog.supermemory.ai/what-is-long-term-memory-ai/)

**Myth: “If the benchmark score goes up, my agent got better”** Reality: Benchmark score and production quality are related but not identical. An agent can overfit to your golden dataset while degrading on the actual distribution of user inputs. Regularly add new cases from real production failures. Your golden dataset should evolve.

**Myth: “I can use accuracy as my main eval metric for agents”** Reality: Accuracy is a fine metric for classification. For agents, you need trajectory metrics — tool selection, planning quality, step-level reasoning — alongside output metrics. Teams evaluating agents with tools built for single-prompt testing routinely miss the failure modes that actually matter, because the failures don’t appear at the final output. [Medium](https://medium.com/@bumurzaqov2/top-10-ai-memory-products-2026-09d7900b5ab1)

**Myth: “Evals are expensive to run”** Reality: Deterministic evals — checking for forbidden phrases, tool usage, response format — are free to run and catch a large class of regressions. LLM-as-Judge adds cost but is still far cheaper than a production incident, a support spike, or a trust-eroding hallucination that reaches thousands of users.

## Mistakes to Avoid

**Building evals after you’ve already broken something.** The time to build your eval suite is before your first production deploy, when you still have the full picture of what “good” looks like and haven’t yet accumulated unknown regressions.

**Only evaluating the happy path.** Your golden dataset should deliberately include adversarial inputs, edge cases, and known failure scenarios. If every case in your dataset passes, your dataset is too easy, not your agent too good.

**Treating your eval suite as static.** Every production failure that reaches a user is a new test case you should have had. Build a discipline of converting incidents into golden cases. Your eval suite should grow with your product.

**Ignoring latency and cost as eval dimensions.** A response that’s 30% more accurate but 4x slower and 3x more expensive is not an improvement for most products. Evaluate your agent’s resource profile alongside quality metrics, especially when comparing model versions.

**Using the same judge model and agent model without validation.** It introduces a systematic bias in your quality scores. Even a quick human spot-check of 20–30 judge decisions tells you whether your judge is reliable before you scale it.

## The 2026 Eval Tooling Landscape (What to Reach For)

You don’t need to build everything from scratch. Here’s a practical orientation:

> The leading platforms in 2026 — Latitude, Langfuse, LangSmith, Arize, and Galileo — each serve a distinct use case: Langfuse for open-source tracing and data control; LangSmith for LangChain-native debugging; Arize for hybrid ML and LLM monitoring; and Galileo for hallucination detection and guardrails. [arxiv](https://arxiv.org/pdf/2604.04853)

A simple decision guide:

## The 2026 Eval Tooling Landscape (What to Reach For)

-   **Starting out / small team:** Build deterministic evals yourself + Braintrust or Langfuse for tracing. Free tiers are genuinely useful.
-   **LangChain / LangGraph stack:** LangSmith is native and saves integration overhead.
-   **Hallucination is your primary risk:** Galileo has the most purpose-built tooling for this.
-   **Production observability is the priority:** Arize or Langfuse with trace logging gives you the visibility you need.

The platform matters less than the discipline. An imperfect eval suite that you actually run beats a perfect platform you never got around to integrating.

## Key Takeaway

Every day you ship an agent without evals, you’re making a bet that nothing silently broke, and you have no way to know whether you won or lost that bet until a user tells you.

> ## Key Takeaway
> 
> As AI agents move from demos to production workflows — support automation, copilots, internal assistants, agentic product features — evaluation can’t stay ad hoc. [arXiv](https://arxiv.org/pdf/2504.19413)

The bar is not high to start. A golden dataset of twenty cases and a script that runs in two minutes is infinitely better than spot-checking by feel. Start there. Grow it with every incident. Automate it on every meaningful change.

An untested agent is a liability with a chat interface. Build the instruments before you need them.

> **_Honest question: what does your current eval process actually look like? Golden dataset and CI pipeline, or manual testing and hope? No judgment just drop it in the comments. Curious where people actually are on this._**