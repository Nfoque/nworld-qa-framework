# Test-Driven AI: Building Deterministic CI/CD Evaluations for Genkit in Go

[

![ElAmir Mansour](Test-Driven%20AI%20Building%20Deterministic%20CICD%20Evaluations%20for%20Genkit%20in%20Go%20%20by%20ElAmir%20Mansour%20%20Jun,%202026%20%20Medium/1PBE5NxgYpBF5-zLfxwGgSA.jpeg)





](https://elamir.medium.com/?source=post_page---byline--f4d26f457e5f---------------------------------------)

[ElAmir Mansour](https://elamir.medium.com/?source=post_page---byline--f4d26f457e5f---------------------------------------)

Follow

3 min read

·

19 hours ago

Listen

Share

More

Software engineers are masters of the `deterministic` realm. We write a line of code, we expect a specific output, and we write a `unit test` to prove it. But the rise of `Large Language Models` or `LLMs` has introduced a variable that breaks our traditional testing `pipelines`: `probabilistic` output. When you update a `system prompt` or the model provider releases a new `model version`, your `agent` behavior shifts in subtle, often dangerous ways. This article explores how to regain control using `Genkit` and `Go`.

## The Core Problem: Testing the Unpredictable

Press enter or click to view image in full size

![](Test-Driven%20AI%20Building%20Deterministic%20CICD%20Evaluations%20for%20Genkit%20in%20Go%20%20by%20ElAmir%20Mansour%20%20Jun,%202026%20%20Medium/1DmcPHQrKVM6-CXMiEOtMHQ.png)

## The Core Problem: Testing the Unpredictable

In traditional `software engineering`, a change in logic is either right or wrong. With `AI`, a change in a `prompt` might improve accuracy for one edge case while causing a `regression` in ten others. If you depend on exact string matching, your tests will be brittle and useless. The goal is to move from boolean logic to `threshold-based` continuous evaluation.

## Bridging the Gap Between SWE and ML

To solve this, we must adopt a different perspective. In the book Building Machine Learning Powered Applications, Emmanuel Ameisen identifies a critical distinction: `software testing` checks logic, while `ML validation` evaluates behavior against a distribution of expected outcomes.

We bridge this gap by implementing three core components: `proxy metrics` to quantify quality, `golden datasets` to serve as our `holdout sets`, and `automated continuous evaluation` within our `CI/CD` loops.

## The Genkit Evaluation Suite and LLM-as-a-Judge

Google’s `Genkit` framework offers a robust way to build and trace `AI` flows. To implement high-fidelity testing, we use the `LLM-as-a-Judge` pattern. Instead of checking if an output is exactly equal to a string, we task a secondary `LLM` to act as a judge. This judge scores the `primary agent` based on a specific `rubric`, such as `factual accuracy`, `toxicity`, or `schema compliance`.

## Implementation: Building the Test Suite in Go

We start by defining a `golden dataset` in `JSON`.

```json
[
  {
    "input": "Write a Go function to reverse a string.",
    "context": "Use runes to handle Unicode properly.",
    "expected_output": "func Reverse(s string) string { ... }"
  }
]
```

Next, we write our evaluation logic in `Go`...

```go
func TestCodeGenerationAgent(t *testing.T) {


}
```

## Real-World CI/CD Integration

To make this truly useful, we integrate the test suite into `GitHub Actions`. If the `meanAccuracy` logic is triggered, the `GitHub Actions` runner interprets this as a job failure and blocks the `merge`.