# Recurring patterns

Patterns that appear repeatedly when cross-referencing news and repos. If something
appears only once it is an *insight*; if it appears multiple times and starts to look
like a domain norm, it is a *pattern* and lives here.

## Format

```
### [Pattern name]
- **Appearances:** list of sources where we have seen it
- **Description:** what it is and how it manifests
- **Implication for qa-framework:** how we apply it (or why not)
```

---

### Decomposition into 3 layers / 3 agents / 3 pipelines
- **Appearances:**
  - Kshirsagar — 3 Pipelines (structural / semantic / regression)
  - Kshirsagar — 3 Agents XPath (Archaeologist / Refactor / Validator)
  - Kastner — `references/ai-qa-framework/` (crawl / plan / execute reports)
  - Pattnaik — pytest/OpenShift (serving API / output quality / RAG pipeline)
- **New nuance (Pattnaik):** their 3 layers are not sequential phases but **quality dimensions stacked by dependency**: serving (does it respond?) → output quality (is the response good?) → pipeline (does the RAG retrieve the right thing?). This suggests that "3 layers" admits two readings — temporal pipeline *and* reliability stack. The **serving/infra layer (200/latency/schema) is a Layer 0** that the rest of the corpus assumes implicitly and never tests explicitly.
- **Description:** Multiple authors converge on architectures with **three specialized stages**, where each stage has a clear role and the next one consumes the output of the previous one with a well-defined contract. This is not a coincidence — it reflects a natural decomposition of the problem: *audit/discover → transform/generate → validate/regression*.
- **Implication for qa-framework:** Adopt the decomposition as a skeleton. **Three orthogonal responsibilities instead of a monolithic agent that does everything**. The name can be different (don't obsess over it being exactly "3"), but the phase separation matters.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (pipeline: parse → assemble → generate)

### Golden dataset / ground truth as mandatory investment
- **Appearances:**
  - Kshirsagar — 3 Pipelines (120 queries built in 3 days)
  - Kshirsagar — PromptFoo (120 cases × 3 sources: prod logs, adversarial, regression)
  - Garvanand — Vibes-Based Deployment (golden cases with expected_tools, should_not_contain)
  - Kastner — implicit in their "hints" injection
- **Description:** Every eval framework depends on a carefully constructed dataset. If it is poorly built, all scores are noise. There is no shortcut. **Three mandatory sources**: production logs (real intent), adversarial prompts (known failure modes), regression cases (historical bugs).
- **Implication for qa-framework:** **Dataset management is a first-class module**, not a detail. The framework must offer explicit tooling to: ingest from logs, label as adversarial, promote-from-prod-failure. Without this, the rest of the framework does not produce reliable signal.

### Confidence + citation as LLM output format
- **Appearances:**
  - Kshirsagar — 3 Agents XPath (confidence score 0-100 + rationale + routing)
  - Singh — RAG failure analysis ("Confidence: 87%. Similar to DEF-1023")
  - Garvanand — LLM-as-Judge with thresholds + rationale
- **Description:** Useful outputs from an LLM in a QA context are **never** just the judgment — they are judgment + confidence + verifiable citation (to ground truth, to a similar case, or to a reference). This enables automatic routing and auditing.
- **Implication for qa-framework:** **Mandatory schema** for LLM outputs in the framework: `{judgment, confidence, rationale, references[]}`. Do not accept raw outputs as public API.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (quality rule #2: confidence + rationale)

### Build-time vs run-time separation
- **Appearances:**
  - Sanaev — Playwright MCP (MCP at build, CLI at run)
  - Kastner — regression vs exploratory testing
  - Kshirsagar — 3 Pipelines (semantic eval depends on external judge → non-blocking; structural/regression do block)
- **Description:** What assists the QA during test design **must not** be in the test execution path in CI. There is a hard boundary between exploration tools (LLM in a loop with the engineer) and regression tools (deterministic, reproducible, in pipeline).
- **Implication for qa-framework:** Likely split into two packages/binaries: one with heavy dependencies (LLM, MCP) for interactive use, another lightweight and deterministic for CI. **Do not mix.**
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (skill-first = build-time; Playwright CLI = run-time)

### OpenAI-compatible API as portability layer
- **Appearances:**
  - Kshirsagar — Local LLM Pipeline (Ollama exposes OpenAI-compatible REST)
  - Garvanand — tooling landscape (Langfuse/LangSmith/Arize all abstract over multiple providers)
  - Singh — generic stack ("LLM: GPT / Claude" interchangeable at layer level)
- **Description:** The ecosystem converges on the OpenAI spec as a common interface. Local models (Ollama, LM Studio), gateways (LiteLLM), observability tools — they all speak that protocol.
- **Implication for qa-framework:** Build against this interface, NOT against the Anthropic-specific SDK. If we need Claude-specific features (caching, citations, computer use), expose them as extensions of the base interface, not as direct coupling. **This decision is load-bearing** — local/cloud portability depends on it.
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (appendix: model selection)

### Convergent tool stack (eval & observability)
- **Appearances:**
  - Garvanand — explicit ("Langfuse, LangSmith, Arize, Galileo")
  - Kshirsagar — DeepEval, PromptFoo, RAGAS
  - Singh — LangChain, LlamaIndex, ChromaDB, Pinecone
- **Description:** There is clear convergence on which tools compose the stack:
  - **Eval/judge:** DeepEval, RAGAS, PromptFoo
  - **Observability/tracing:** Langfuse, LangSmith, Arize, Galileo, Braintrust
  - **Orchestration:** LangChain, LlamaIndex, LangGraph
  - **Vector store:** ChromaDB, Pinecone, Qdrant
- **Implication for qa-framework:** Do not reinvent these layers. **Integrate** with the most obvious options and let the user choose. The framework's contribution is the orchestration + the QA-specific domain (golden datasets, regression baselines, failure analysis), not the eval/tracing primitives.
- **Lock-in gotcha (Pattnaik, 2026-06-02):** **DeepEval has a hard OpenAI dependency that cannot be overridden** — unusable in local-first / multi-provider setups. Pattnaik had to replace it with a custom judge function (Groq). This reinforces the "OpenAI-compatible API as portability layer" decision: when integrating eval tooling, verify that the judge is swappable, not hardwired to a provider.

### Properties over content (various forms)
- **Appearances:**
  - Kshirsagar — 3 Pipelines (asserting on structural, semantic, regression properties)
  - Kshirsagar — PromptFoo (criteria-based expected outputs, no string match)
  - Garvanand — trajectory eval (asserting on tool selection & path, not just final text)
  - ElAmir — Genkit/Go ("score, don't assert" → `score >= threshold`, not `== expected`)
  - Pattnaik — pytest/OpenShift ("score, don't assert" explicit as lesson #1)
- **Consolidation note (2026-06-02):** there are now **5 independent sources** converging on "score, don't assert". It is no longer an emerging insight — it is the domain norm. Any assertions API in the framework that offers literal equality as a first-class citizen is poorly designed.
- **Description:** Three authors, three angles, same idea: **do not compare literal content — declare what property you expect and assert on it**. The "content" changes between runs without losing correctness; the "property" holds if the model does its job.
- **Implication for qa-framework:** The framework's assertions API should nudge toward property declarations, not string equality. Likely: explicit assertion types (`assertGrounded`, `assertReferencesEntity`, `assertWithinLengthBounds`, `assertSimilarTo(baseline, threshold)`).
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (quality rule #1), `qa-framework/protocol/prompt-templates/generate-e2e-spec.md`

### Negative-retrieval test (fake-fact injection)
- **Appearances:**
  - Pattnaik — pytest/OpenShift (injects `"the secret deployment colour is ULTRAVIOLET"` into the vector store and asserts that the model uses it)
- **Description:** To validate that a RAG pipeline **actually retrieves** and does not answer from training memory: plant a fact in the vector store that the model cannot know (false, unique, absent from the training corpus) and verify it appears in the response. If it shows up → retrieval works. If the model gives the "real" answer from memory → the RAG is broken even though the output looks correct. It is the dual of the hallucination test: instead of "did it invent something outside the context?", it asks "did it actually use the context I gave it?".
- **Implication for qa-framework:** Assertion primitive for RAG: `assertAnswerDerivedFromContext(injectedFact)`. Distinguishes two failures that a pure output eval confuses — correct-answer-but-for-the-wrong-reason (memory) vs correct-by-retrieval. Only one appearance so far → it is a **strong insight, not yet a pattern**; watch for reappearance.

### Strict convention contract (AGENTS.md pattern)
- **Appearances:**
  - Nesvitii — MCP + Playwright + Jira (strict vs descriptive AGENTS.md: ~95% vs ~70% compliance)
  - Kshirsagar — 3 Agents XPath (specialized agents with strict role — Archaeologist only reads, never modifies)
  - Kastner — postmortem (`.qa-framework/` rules that the LLM ignores when they are vague)
- **Description:** When an LLM generates code that must respect conventions, the format of the contract matters as much as its content. Explicit prohibitive rules ("PROHIBITED", "NEVER", "ONLY") produce compliance >90%. Descriptive guidelines ("prefer", "try to", "when possible") produce ~70%. The observed progression: system prompt only (~70%) → few-shot examples (~85%) → strict contract + ground truth from the DOM (~98%).
- **Implication for qa-framework:** The test-conventions parser must emit rules in contract format (strict, prohibitive), not in statistical format ("80% uses getByTestId"). The generation prompt template must consume this contract as a literally injected block, not as descriptive context.
- **Implication for QAAP:** The Convention Parser (Stage 1) must transform extracted conventions to strict contract format before passing them to the assembler. The user should be able to edit/override the generated contract.

### Normalisation step for freeform input
- **Appearances:**
  - Nesvitii — MCP + Playwright + Jira (dedicated pre-pipeline LLM call to normalize tickets)
  - Singh — RAG failure analysis (classifies failure before performing RCA — similar separation of concerns)
- **Description:** When the pipeline input is freeform (Jira tickets, documents, pasted requirements), a cheap dedicated LLM call converts it to structured JSON *before* it enters the main pipeline. This separates parsing from reasoning. The main pipeline never sees format ambiguity — it receives a clean contract.
- **Implication for qa-framework:** The Jira parser is the first module that needs this (currently a placeholder). The pattern is generalizable to any source that does not have a fixed schema (documents, free text, conversations).
- **Implication for QAAP:** Sub-stage of Stage 1 (Parse). Uses task type `classification` — small/fast model. The quality of the normalization can be validated before spending tokens on generation.

### Observation-based debug (evidence over inference)
- **Appearances:**
  - Nesvitii — MCP + Playwright + Jira (screenshot + DOM snapshot → fix based on visual evidence)
  - Sanaev — Playwright MCP (DOM inspection as a build-time tool, not run-time)
- **Description:** When a generated test fails, the retry loop feeds the LLM with evidence of the application's real state (screenshot, DOM snapshot, selector map) instead of just the error message. The fix is based on observation, not inference. Nesvitii reports first-attempt correction in most cases.
- **Implication for qa-framework:** Pattern for the validation loop (currently "genuinely new" in STATUS.md). Requires the framework to have access to an executable environment (local/staging) — does not work in pure offline mode.
- **Implication for QAAP:** Integrate in Stage 6 (Auto-codification) as post-codification retry. Requires the tenant to have `targetEnvironment.url` configured. If no environment is available, fallback to retry based only on error message (degraded mode).

### Living dataset (promotion-from-incident)
- **Appearances:**
  - Kshirsagar — PromptFoo (dataset as a living document, rebaselined with each model change)
  - Garvanand — "every production failure that reaches a user is a new test case you should have had"
- **Description:** The golden dataset is not an initial artifact — it is the **accumulated result** of operating the system. Each incident must become a new case in the set.
- **Implication for qa-framework:** Explicit UX for "promote this failure to permanent test case". This is not a nice-to-have; it is what distinguishes a framework that gets used from one that gets abandoned.
