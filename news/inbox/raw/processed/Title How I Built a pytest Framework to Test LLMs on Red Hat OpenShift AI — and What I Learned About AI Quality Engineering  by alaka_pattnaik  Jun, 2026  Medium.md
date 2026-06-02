# Title: How I Built a pytest Framework to Test LLMs on Red Hat OpenShift AI — and What I Learned About AI Quality Engineering

[

![alaka_pattnaik](Title%20How%20I%20Built%20a%20pytest%20Framework%20to%20Test%20LLMs%20on%20Red%20Hat%20OpenShift%20AI%20%E2%80%94%20and%20What%20I%20Learned%20About%20AI%20Quality%20Engineering%20%20by%20alaka_pattnaik%20%20Jun,%202026%20%20Medium/0IeEC-orYv8cxAkvv.png)





](https://medium.com/@alakap2026?source=post_page---byline--c94315f72fad---------------------------------------)

[alaka\_pattnaik](https://medium.com/@alakap2026?source=post_page---byline--c94315f72fad---------------------------------------)

Follow

4 min read

·

1 day ago

Listen

Share

More

## Subtitle: A practical guide to testing hallucination, RAG pipelines, and model serving with open source tools

Introduction

AI systems fail differently from traditional software.

A REST API either returns 200 or it doesn’t. A database  
query either returns the right rows or it doesn’t. These  
are deterministic, binary outcomes — perfect for  
traditional test automation.

But LLMs? An LLM can return HTTP 200, valid JSON, and  
a response within your latency SLA — and still confidently  
hallucinate facts, give irrelevant answers, or fabricate  
information outside the provided context.

That’s the problem I set out to solve.

During my sabbatical I built agenteval-platform-openshift  
— an open source pytest-based test automation framework  
for validating AI model serving, LLM output quality, and  
RAG pipeline reliability on Red Hat OpenShift AI.

Here’s what I built, what I learned, and why I think  
AI quality engineering is the most interesting problem  
in software today.

The Framework Architecture

I designed the framework in three layers — each testing  
a different dimension of AI quality.

Layer 1 — Model Serving API Tests  
The foundation. Before testing quality, test reliability.

These tests validate:  
\- HTTP 200 responses from inference endpoints  
\- Response latency within configured SLA  
\- Valid JSON schema in responses  
\- Edge cases — empty prompts, special characters,  
long inputs, concurrent requests

Tools: pytest + httpx + Ollama (llama3.2 local)

These run in under 10 seconds and catch infrastructure  
failures before they reach production.

Layer 2 — LLM Output Quality Tests  
This is where traditional QA ends and AI QE begins.

I used Groq’s llama-3.3–70b-versatile as a judge model  
to score the outputs of my local llama3.2 model on three  
dimensions:

Hallucination — did the model make up facts not in  
the provided context?

Faithfulness — did the answer stay within the bounds  
of what was retrieved?

Relevancy — is the answer actually useful for the  
question asked?

The judge model approach is the industry standard for  
LLM evaluation. You need an LLM to evaluate an LLM —  
rule-based assertions simply can’t capture natural  
language quality.

Key insight: I initially used DeepEval for this layer  
but discovered it has a hard OpenAI dependency that  
can’t be overridden. I replaced it with a custom Groq  
judge function — giving full control over the scoring  
rubric and zero external cost.

Layer 3 — RAG Pipeline Tests  
RAG (Retrieval Augmented Generation) is how most  
production AI products work. Instead of relying on  
training data, the system retrieves relevant documents  
and provides them as context to the LLM.

I built a complete RAG agent using:  
\- LangChain LCEL for pipeline orchestration  
\- ChromaDB for vector storage  
\- nomic-embed-text for document embeddings  
\- Ollama llama3.2 for generation

Then I wrote tests validating:  
\- Does the retriever return relevant documents?  
\- Does the answer contain keywords from retrieved context?  
\- Is the model answering from retrieval — not memory?  
\- Does it correctly say “I don’t know” for out-of-context  
questions?

The most interesting test: inject a fake fact into the  
vector store (“the secret deployment colour is  
ULTRAVIOLET”) and assert the model uses it. If it does,  
retrieval is working. If it gives the real answer from  
training memory — your RAG pipeline is broken.

Connecting to Real Red Hat OpenShift AI

I deployed the framework against a real Red Hat  
Developer Sandbox cluster.

Steps I took:  
1\. Created a ModelMesh serving runtime with OpenVINO  
2\. Deployed an ONNX model (MNIST classifier)  
3\. Validated the InferenceService reached Ready status  
with 5/5 containers running  
4\. Created an external route for HTTP access  
5\. Tested the KServe V2 inference protocol

Key learning: The framework uses a protocol abstraction  
layer — the same pytest tests run against local Ollama  
in development and KServe endpoints in production.  
Switching environments requires one line change in  
test\_config.yaml:

environment: “local” # change to “openshift”

This is the architecture pattern that makes AI test  
frameworks production-grade.

What I Learned About AI Quality Engineering

1\. Score, don’t assert  
Traditional testing: assert response == expected\_value  
AI testing: assert score >= threshold

LLM outputs are non-deterministic natural language.  
You can’t assert exact values — you score quality  
on a continuous scale and assert the score meets  
your threshold.

2\. You need a judge model  
The only reliable way to evaluate LLM output quality  
is with another LLM as judge. Human evaluation doesn’t  
scale. Rule-based metrics miss nuance. LLM-as-judge  
is fast, consistent, and surprisingly accurate.

3\. Test the pipeline, not just the model  
Most AI failures happen at the pipeline level —  
wrong documents retrieved, context window overflow,  
prompt template bugs. Testing only the model output  
misses 60% of real failures.

4\. Non-determinism is a feature, not a bug  
Your tests will sometimes pass and sometimes fail  
on the same code. That’s not flakiness — that’s  
the model behaving differently on different runs.  
Track score trends over time, not individual  
pass/fail results.

5\. Traditional QE skills matter more than ever  
AI engineers know models. QE engineers know failure  
modes. The intersection — knowing both what can go  
wrong AND how to systematically validate it — is  
where the most valuable AI QE work happens.

The Tech Stack (All Open Source, Zero Cost)

\- pytest + httpx — test execution and API calls  
\- Ollama — local LLM inference (llama3.2)  
\- Groq — LLM judge (llama-3.3–70b, free tier)  
\- LangChain — RAG pipeline orchestration  
\- ChromaDB — vector database  
\- nomic-embed-text — document embeddings  
\- GitHub Actions — CI pipeline  
\- Allure — test reporting

Total cost: $0. Entire stack runs locally or on  
free tiers.

Results

36 tests across 4 layers  
100% pass rate  
2 environments — local Ollama + Red Hat OpenShift AI  
Full Allure report:  
[https://alakapatnaik.github.io/agenteval-platform/](https://alakapatnaik.github.io/agenteval-platform/)

GitHub:  
[https://github.com/alakapatnaik/agenteval-platform](https://github.com/alakapatnaik/agenteval-platform)

What’s Next

I’m actively seeking Staff SDET, Test Architect, and  
Engineering Manager QE roles in Bengaluru — specifically  
in AI/LLM and cloud-native platforms.

If you’re building AI products and care about quality,  
I’d love to connect.

LinkedIn: [linkedin.com/in/alaka-pattnaik/](https://www.linkedin.com/in/alaka-pattnaik/)  
GitHub: github.com/alakapatnaik