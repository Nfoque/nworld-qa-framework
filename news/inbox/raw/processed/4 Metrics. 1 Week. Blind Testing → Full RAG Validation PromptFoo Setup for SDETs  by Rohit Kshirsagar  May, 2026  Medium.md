# 4 Metrics. 1 Week. Blind Testing → Full RAG Validation: PromptFoo Setup for SDETs

[

![Rohit Kshirsagar](4%20Metrics.%201%20Week.%20Blind%20Testing%20%E2%86%92%20Full%20RAG%20Validation%20PromptFoo%20Setup%20for%20SDETs%20%20by%20Rohit%20Kshirsagar%20%20May,%202026%20%20Medium/0oG8D4zilqU8Cn08k.jpeg)





](https://medium.com/@krohit0389?source=post_page---byline--f87b8211eb8a---------------------------------------)

[Rohit Kshirsagar](https://medium.com/@krohit0389?source=post_page---byline--f87b8211eb8a---------------------------------------)

Follow

8 min read

·

May 5, 2026

Listen

Share

More

**Our AI feature was being validated by manual testers with no objective metrics, no regression baseline, and no way to detect subtle quality degradation between releases. One week of PromptFoo setup across 4 metrics changed that completely — and surfaced 14 failing prompt variants that manual review had passed. Here is the exact setup, the metric choices, and what we learned.**

Press enter or click to view image in full size

![](4%20Metrics.%201%20Week.%20Blind%20Testing%20%E2%86%92%20Full%20RAG%20Validation%20PromptFoo%20Setup%20for%20SDETs%20%20by%20Rohit%20Kshirsagar%20%20May,%202026%20%20Medium/1NYPtEYTw3WsJeWRN_QT_zw.png)

There is a specific kind of confidence that is more dangerous than uncertainty. It is the confidence that comes from a manual testing session that went well — where the tester tried the happy paths, the responses sounded reasonable, nothing obviously broke, and the feature got marked as ready. It feels like validation. It is not.

For deterministic software, that kind of session is a reasonable signal. For LLM-powered features, it is a liability. Language models do not fail by throwing exceptions or returning null. They fail by being confidently wrong, subtly off-topic, inconsistent across semantically similar inputs, or quietly toxic in edge cases no one thought to test. None of those failure modes are visible in a manual walkthrough. All of them erode user trust, and all of them are measurable if you build the right framework.

PromptFoo is that framework. It is a YAML-first, CI-native LLM evaluation tool that lets you define test cases, specify metrics, run prompt variants head to head, and get a structured pass/fail report against a ground-truth dataset. It is not the only LLM eval tool available — DeepEval, RAGAS, and others occupy the same space — but for SDETs already comfortable with CI configuration, its approach maps naturally onto existing quality thinking.

This is a complete account of a one-week setup, what it found, and what it changed.

## Why PromptFoo Over Other Eval Frameworks

The choice of PromptFoo over alternatives was driven by three specific characteristics. First, its configuration is YAML-based, which means the test definitions live in version control alongside the application code and are reviewable in the same PR process as any other configuration change. Second, it natively supports prompt variant comparison — running multiple versions of a system prompt against the same dataset and producing a side-by-side accuracy comparison — which was directly relevant to our use case, where we were actively iterating on the system prompt. Third, it integrates cleanly with GitHub Actions via a single CLI command, meaning the eval run becomes a standard CI step with no custom orchestration required.

DeepEval was the other serious candidate. Its metric library is richer and its Python-native interface is more flexible for complex custom metrics. For teams doing deep RAG pipeline validation with custom graders, DeepEval is often the stronger choice. For teams that want fast CI integration and prompt variant comparison in a familiar config format, PromptFoo gets to useful results faster.

The right answer depends on your team’s existing tooling. The wrong answer is using neither.

## Building the Ground-Truth Dataset

Before any tool configuration, the dataset. This step takes longer than most teams expect and matters more than any other single decision in the setup process.

A PromptFoo ground-truth dataset is a collection of test cases, each containing an input prompt, the expected output or expected characteristics of the output, and optionally the context documents that the RAG pipeline should retrieve to answer the question. We built ours from three sources across the first two days of the week.

The first source was production query logs — real questions users had asked the AI feature, anonymised and cleaned. These are the most valuable test cases because they represent actual user intent rather than what the team imagined user intent to be. We pulled 90 queries from a two-week log window, categorised them by intent type, and selected a representative sample across all categories.

The second source was adversarial prompts written specifically to probe known failure modes — questions outside the model’s knowledge scope, ambiguous queries with multiple valid interpretations, questions that the retrieval layer was likely to handle poorly due to sparse coverage in the knowledge base, and prompts designed to test the toxicity guardrails.

The third source was a small set of regression test cases derived from bugs that had reached production in the previous quarter. If the model had failed on these inputs before, they belong in the permanent eval dataset.

The final dataset was 120 test cases. For each, we defined the expected output not as an exact string match — which is almost never appropriate for language model outputs — but as a set of criteria the response should satisfy: the claim it must make, the claim it must not make, the source it must reference, or the format it must follow.

## The Four Metrics and Why Each One Was Chosen

The metric selection was deliberate, covering four distinct failure modes that manual testing had proven unable to reliably detect.

Answer correctness measured whether the model’s response contained the factually correct information relative to the ground-truth expected output. This is the baseline metric — the one that tells you whether the model is getting the answer right in the first place. We set the threshold at 0.85, meaning a test case passes if the semantic similarity between the response and the expected output exceeds 0.85. This allows for natural language variation while still catching responses that are meaningfully wrong.

Context adherence measured whether every claim in the response could be grounded in the retrieved context documents. This is the hallucination detector for RAG systems specifically — it is not enough for the model to produce a correct-sounding answer if that answer is not derivable from what the retrieval layer provided. A model that answers correctly but from memory rather than retrieved context is a model that will fail unpredictably when the knowledge base changes.

Toxicity measured whether the response contained harmful, offensive, or inappropriate content across a set of adversarial input prompts. This metric is often deprioritised by teams who believe their use case is too narrow for toxicity to be a concern. The adversarial test cases we included in the dataset showed that even narrow-domain AI features can produce unexpected outputs on edge case inputs. Measuring it costs almost nothing to add and has asymmetric downside risk if skipped.

Response consistency measured whether semantically equivalent input prompts produced semantically equivalent outputs. If a user asks “how do I reset my password” and another asks “what are the steps to change my password,” the model should produce responses that are not just both correct but meaningfully consistent with each other. Inconsistency at scale — where different users asking the same question receive substantively different answers — is a quality problem that no individual manual test session will catch because no single tester will think to run both phrasings.

## The Setup: YAML Config and CI Integration

Day three of the week was the PromptFoo configuration. The tool’s YAML structure defines providers, which are the model endpoints being tested; prompts, which are the system prompt variants under evaluation; and tests, which are the individual test cases with their expected outputs and metric assertions.

The provider configuration pointed at our RAG pipeline’s API endpoint rather than directly at the model, which meant PromptFoo was evaluating the full system — retrieval plus generation — rather than just the generation layer in isolation. This is the correct approach for RAG validation: the pipeline is the product, and the eval should test it as such.

We defined three system prompt variants: the current production prompt, a revised version that added explicit grounding instructions, and a more constrained version that limited response length and added citation requirements. Running all three against the same 120-case dataset simultaneously is where PromptFoo’s prompt variant comparison earned its place in the workflow — a head-to-head accuracy table across all four metrics for all three prompts, produced in a single run.

The GitHub Actions integration required four lines of configuration: install PromptFoo via npm, set the API endpoint and credentials as environment secrets, run the eval command against the YAML config, and fail the workflow if the output contains any metric below threshold. The full CI step adds approximately 8 minutes to the pipeline run time for 120 test cases.

## What the First Run Found

The first full eval run, on day four, produced results that immediately justified the setup time.

Across the 120 test cases, the current production prompt scored 0.81 on answer correctness against the 0.85 threshold — failing. Context adherence scored 0.73, well below the 0.80 threshold we had set. Toxicity passed cleanly. Response consistency scored 0.76 against a 0.80 threshold.

Fourteen individual test cases that had been passing manual review were flagged as failing by the eval. Examining them was instructive. Most of the answer correctness failures were not dramatically wrong responses — they were responses that were partially correct but omitted a critical piece of information or introduced a plausible-sounding but unsupported claim. Exactly the failure mode that sounds fine in a manual session and erodes trust over repeated exposure.

The context adherence failures were concentrated in a specific intent category — questions that required synthesising information across multiple retrieved chunks. The model was producing correct-sounding responses but drawing on parametric knowledge rather than the retrieved context when the retrieval layer returned sparse or fragmented results.

The prompt variant comparison showed the revised prompt with explicit grounding instructions scoring 0.89 on context adherence — a 16-point improvement over production — at a small cost to response naturalness that the consistency metric partially captured. That data drove a prompt update decision that would otherwise have required a lengthy debate between the product and engineering teams.

## The Honest Caveats

PromptFoo’s answer correctness metric relies on semantic similarity scoring, which is sensitive to the quality of the expected outputs defined in the dataset. Poorly written ground-truth expectations produce unreliable metric scores — garbage in, garbage out applies as much to eval frameworks as to models. Building the dataset carefully is not optional.

The 120-case dataset covers the query patterns observed in two weeks of production logs. It does not cover unusual query types, future feature expansions, or the long tail of edge cases that real users will eventually surface. The eval suite should be treated as a living document — updated when new failure modes are discovered, expanded when new feature scope is added, and re-baselined when the underlying model or retrieval layer changes significantly.

PromptFoo also does not natively support all RAG-specific metrics. Context precision and context recall — measuring the quality of the retrieval layer specifically — require either custom graders or a complementary tool like RAGAS or DeepEval. For teams doing deep retrieval quality analysis, PromptFoo and DeepEval together cover the full pipeline more completely than either does alone.

## What Changes When Blind Testing Ends

The most significant outcome of the first week was not the 14 flagged test cases or the prompt update it drove. It was the change in how AI feature quality was discussed in sprint reviews.

Before PromptFoo, quality conversations were impressionistic. The feature “felt good” or “seemed improved.” After, they were specific. Answer correctness moved from 0.81 to 0.88. Context adherence is at 0.89 and trending up. Response consistency has a regression in the latest prompt variant that needs investigation before this ships.

Those are conversations that lead to decisions. Impressions lead to debates.

Blind testing is not a QA strategy. It is what you do before you have one.

_Subscribe to Automate & Elevate on YouTube for weekly content on LLM validation, RAG pipeline testing, and SDET tools that turn AI quality from a feeling into a number._

_#PromptFoo #LLMTesting #RAG #QAAutomation #AI #SDET #TestAutomation_