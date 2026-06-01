# 3 Pipelines. 14 Days. 0 → 500 AI Test Assertions: Building LLM QA Automation from Scratch

[

![Rohit Kshirsagar](https://miro.medium.com/v2/da:true/resize:fill:64:64/0*oG8D4zilqU8Cn08k)





](https://medium.com/@krohit0389?source=post_page---byline--9853f219663a---------------------------------------)

[Rohit Kshirsagar](https://medium.com/@krohit0389?source=post_page---byline--9853f219663a---------------------------------------)

Follow

9 min read

·

May 8, 2026

Listen

Share

More

**Two weeks ago our LLM feature had zero automated test assertions — not low coverage, zero. Three layered pipelines built over 14 days changed that to 500 assertions running on every pull request. Here is the exact architecture, the sequencing logic, and the single insight that made non-deterministic output testable.**

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*Grlbdf0GaRSR6u9PTOzphQ.png)

The most common reason QA teams have no automated coverage on their LLM features is not that they have not tried. It is that they tried, ran into the non-determinism problem, and stopped. The assertion failed because the response was different from last time — not wrong, just different — and the engineer concluded that LLM outputs are fundamentally untestable with the tools they had.

That conclusion is understandable and incorrect. LLM outputs are non-deterministic in their exact phrasing. They are not non-deterministic in their properties. A response that is well-grounded in its source context is well-grounded every time a good prompt is used. A response that covers the required information is structurally identifiable as such. A response that drifts significantly from a validated baseline is detectable as drift even if the exact wording differs.

The shift from asserting on content to asserting on properties is the conceptual unlock that makes LLM test automation practical. Everything that follows from that shift is engineering.

This is the account of 14 days of engineering — three pipelines built in sequence, each one adding a layer of assertion depth, and the team’s testing posture moving from zero to 500 automated assertions running on every PR.

## The Starting Point: Why Zero

It is worth being precise about how a team ends up with zero automated assertions on a shipped LLM feature. It is not negligence. In our case, the feature had been developed over eight weeks with active manual testing throughout. Exploratory sessions, prompt review meetings, a shared doc of known edge cases, a human sign-off process before each release. The quality investment was real.

What was missing was anything that ran automatically on each code change. Every PR that touched the system prompt, the retrieval configuration, the model parameters, or the application logic wrapping the LLM went through a human review cycle rather than an automated check. The human cycle caught obvious regressions. It did not catch subtle ones — the prompt change that improved response tone while silently degrading factual grounding, or the retrieval parameter tweak that improved average context precision while introducing a new failure mode on edge case queries.

The case for automation was not that manual testing was failing. It was that manual testing at PR frequency is not sustainable, and the failure modes that matter most in LLM systems are exactly the ones that are hardest to catch in a manual review.

## The Architecture Decision: Three Layers, Not One

The temptation when building LLM test automation from scratch is to go straight to the sophisticated semantic evaluation layer — set up DeepEval, build a ground truth dataset, define metrics, run it in CI. That approach is correct in direction and difficult in practice because it requires significant upfront investment before producing any CI signal.

The three-pipeline architecture solves this by sequencing the investment. Each pipeline produces value independently and builds the foundation for the next. The team gets CI coverage on day three, not day fourteen. The sophistication increases as the team’s confidence and familiarity with the tooling increases. And the total assertion count of 500 is reached incrementally — not as a single large delivery that requires everything to be right before anything is useful.

Pipeline one targets structural properties — the things that can be asserted without any understanding of the response’s semantic content. Pipeline two targets semantic properties — the things that require a judge model or similarity metric to evaluate. Pipeline three targets regression properties — the things that require a validated historical baseline to compare against.

Three layers. Each one independently deployable. Each one adding assertions the previous layer cannot cover.

## Pipeline One: Structural Assertions (Days 1 to 4)

Structural assertions are the fastest to write, the cheapest to run, and the most underrated layer in LLM test automation. They answer a simple set of questions: did the model return a response at all, is it in the expected format, does it contain the required fields, is it within acceptable length bounds, does it avoid obviously prohibited content patterns.

None of these require semantic understanding. They require knowing what a valid response looks like structurally — and for most LLM features, that specification already exists implicitly in the product requirements. The work is making it explicit and executable.

We built the structural pipeline in four days using pytest and a lightweight fixture library. Each test case in the 120-query dataset we had built from production logs was run against the live endpoint, and the response was evaluated against six structural checks: non-null output, minimum token length of 50, maximum token length of 800, JSON structure validity for responses requiring structured output, absence of the model’s refusal phrases, and presence of at least one sentence that references a named entity from the query.

That last check is worth explaining. A response that does not reference any entity from the question it was asked is almost certainly off-topic, even if it is not obviously wrong. It is a structural proxy for relevance that requires no semantic model to evaluate.

By day four, 180 structural assertions were running in CI. The first run flagged 11 test cases — nine where the response exceeded the length bound due to a verbose prompt variant, two where the response was missing a required JSON field in a structured output mode. Both were real issues that had not been caught in manual review.

## Pipeline Two: Semantic Assertions with DeepEval (Days 5 to 10)

The semantic pipeline required more setup time because it introduced DeepEval as a dependency and required the ground truth dataset to be extended with expected output specifications for each test case — not exact strings, but criteria definitions of the form “the response must acknowledge X,” “the response must not claim Y,” “the response must cite a source from the retrieved context.”

We selected four DeepEval metrics for the semantic layer, chosen to cover the specific failure modes our manual testing had historically struggled to catch consistently. Answer relevancy scored whether the response addressed the actual question asked — low relevancy scores corresponded precisely to the “sounds helpful but doesn’t answer the question” failure mode that was the most common complaint in user feedback. Faithfulness scored whether every claim in the response was supported by the retrieved context documents — the hallucination detector specific to RAG architectures. Contextual recall scored whether the retrieved context contained all the information needed to answer the question — a retrieval layer diagnostic rather than a generation layer diagnostic. And a custom coherence metric we built using DeepEval’s custom metric interface scored whether the response was internally consistent, with no contradictory claims within a single response.

Running four DeepEval metrics across 120 test cases adds approximately 14 minutes to the CI pipeline — each metric call invokes a judge model, and judge model calls have latency. We handled this by running the semantic pipeline as a parallel CI job rather than a sequential step, so the 14-minute semantic eval runs alongside the faster unit and integration tests rather than blocking them.

By day ten, 200 semantic assertions were running in the parallel CI job. The threshold configuration — the minimum score below which a test case fails — was calibrated against three sprint cycles of historical data to minimise false positives while maintaining sensitivity to genuine regressions.

## Pipeline Three: Regression Assertions Against a Golden Dataset (Days 11 to 14)

The regression pipeline is conceptually the simplest and operationally the most powerful. It takes the 120-query dataset, runs every query against the current build, computes semantic similarity between each response and the validated baseline response stored for that query, and flags any test case where the similarity drops below a threshold — currently set at 0.78 — as a potential regression.

The baseline responses are not the expected output of an ideal model. They are the validated output of the model as it existed at the last approved release — the output the team explicitly signed off on. A regression assertion does not ask whether the response is good. It asks whether the response has changed meaningfully from what was previously approved.

This distinction matters because it catches a failure mode that neither structural nor semantic assertions cover well: the response that is structurally valid, semantically reasonable, and yet substantially different from the previous behaviour in ways that affect user experience consistency. A model that was giving three-step instructions and now gives seven-step instructions for the same query may be passing all quality metrics while introducing a user experience change that no one intended.

The regression pipeline stores baseline responses in a versioned JSON file committed to the repository. When a release is approved, a single CLI command updates the baseline file to reflect the current model outputs. The history of baseline updates is the commit history of that file — a complete audit trail of every intentional behaviour change.

By day fourteen, 120 regression assertions were running as a third parallel CI job. Total assertion count across all three pipelines: 500. Total CI time added: 18 minutes on the parallel jobs, 4 minutes on the sequential structural job.

## The Honest Caveats

The 500-assertion figure covers 120 unique test cases across three evaluation layers. It does not represent 500 independent test scenarios — many assertions evaluate different properties of the same query-response pair. Teams evaluating coverage depth should count unique test scenarios rather than total assertions.

The regression pipeline’s 0.78 similarity threshold required careful calibration. Set too high, it generates false positives on every release because natural model output variation exceeds the threshold. Set too low, it misses genuine regressions. The calibration process took two days of threshold tuning against historical data and will likely need adjustment each time the underlying model or prompt is significantly changed.

DeepEval’s judge model calls introduce an external dependency into the CI pipeline. If the judge model provider has an outage or rate limit issue, the semantic pipeline fails. We handle this with a circuit breaker — semantic pipeline failures do not block PR merge, they generate a warning and page the QA lead. Structural and regression pipeline failures do block merge. The severity of the dependency matches the severity of the block.

Building a ground truth dataset of 120 queries with proper expected output specifications took approximately three days of focused work. This is not a shortcut-able investment — the quality of the dataset determines the signal quality of every assertion built on top of it. Teams that build the dataset carelessly will have 500 assertions that produce unreliable signal, which is worse than having fewer well-specified ones.

## What 500 Assertions on Every PR Changed

The change in team behaviour was immediate and specific. Developers stopped asking “do you think this prompt change will affect quality” and started reading the CI output. The question became “the faithfulness metric dropped 4 points on these 6 queries — what changed in the retrieval config that affected those cases.” The conversation moved from subjective to diagnostic.

The QA team’s time allocation shifted. Manual exploratory testing on the LLM feature dropped from approximately 6 hours per sprint to 2 hours — the automated pipelines covered the regression and property validation work that had previously been done manually. The 4 hours recovered went to higher-value work: adversarial testing, user journey analysis, and dataset expansion.

The release confidence increased in a way that is difficult to quantify but was consistently reported by the release manager: “I know what the assertions cover, I know what they found, and I know we made a deliberate decision on anything that failed. That is a different starting point for a release conversation.”

Zero to 500 is the metric. What it produced was not 500 assertions. It was a team that stopped guessing about LLM quality and started measuring it.

_Subscribe to Automate & Elevate on YouTube for weekly content on LLM test automation, AI-powered QA pipelines, and SDET tools that make non-deterministic systems testable._

_#LLMTesting #QAAutomation #DeepEval #AI #SDET #TestAutomation #RAG_