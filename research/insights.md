# Distilled insights

Key findings extracted from `news/` and `references/`. Each entry cites its origin.

## Entry format

```
### [Short insight title]
- **Origin:** `news/...` or `references/...`
- **What:** one sentence
- **Why it matters for qa-framework:** one sentence
- **Decision/action:** what we do with this (adopt, prototype, discard)
```

---

## Structural principles (how to conceive the framework)

### Regression vs. Exploratory as a design criterion
- **Origin:** Kastner postmortem + Sanaev MCP (build-time vs run-time) — cross-reinforcement.
- **What:** Regression demands determinism; exploratory is non-deterministic. LLMs fit the latter, not the former. Sanaev reframes the same boundary as "build-time inspector vs run-time executor".
- **Why it matters:** It is the architectural boundary of the framework. What crosses this line carelessly becomes structural flakiness.
- **Decision/action:** Adopt as a guiding principle. Candidate positioning: "LLM-driven exploration + human-curated regression suite".
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md`, `qa-framework/architecture/adr-002-playwright-setup.md`

### Properties over content (the conceptual unlock)
- **Origin:** Kshirsagar — 3 Pipelines. Reinforced by Kshirsagar PromptFoo (criteria-based expected outputs) and Garvanand (trajectory > output).
- **What:** LLM outputs are non-deterministic in phrasing, **not in properties**. Asserting on structural/semantic/regression properties makes the system testable.
- **Why it matters:** Defines what kind of assertions make sense. Any exact string comparison is a trap.
- **Decision/action:** Adopt. Every assertion in the framework must be on an explicitly declared property, not on literal content.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (quality rule #1)

### Trajectory eval ≠ output eval (for agents)
- **Origin:** Garvanand.
- **What:** Agents fail mid-execution. Output-only eval does not catch wrong-tool at step 2 that produces a plausible final response. You must evaluate chosen tools, order, intermediate reasoning.
- **Why it matters:** If `qa-framework` runs as an agent (with tool use), it needs reference trajectories, not just assertions on the final output.
- **Decision/action:** Adopt. Reference trajectory per test case = first-class artifact.

### The pyramid axis changes for LLMs (cost/isolation -> determinism)
- **Origin:** Kapoor — *Pyramids and Diamonds* (non-LLM anchor, 2022) read against the "AI Testing Pyramid rewritten" articles from 2026.
- **What:** The classic pyramid/diamond orders test types along an implicit axis of **cost/speed/isolation** (unit cheap/fast/isolated <-> E2E expensive/slow/realistic). When the layer under test is an LLM, that axis is no longer dominant: execution cost matters less than **output determinism**. The "shape" reorganizes by **type of property evaluated** (structural -> semantic -> behavioral), not by test type.
- **Why it matters:** Prevents uncritically importing the classic pyramid into the framework. The organizational unit of our suite is not unit/integration/E2E but property layers (links to [[patterns#properties-over-content]] and Kshirsagar's layered architecture).
- **Decision/action:** Hypothesis to validate. Do not adopt the classic pyramid as taxonomy; explore a "property pyramid" (structural wide and cheap at the base, behavioral narrow and expensive at the top) as our own mental model.

### Sequenced layered architecture (no big-bang)
- **Origin:** Kshirsagar — 3 Pipelines.
- **What:** Each assertion layer (structural -> semantic -> regression) delivers value independently. CI signal on day 3, not day 14.
- **Why it matters:** The framework must be deliverable in layers, not as a monolithic suite that needs to be "complete" before it starts adding value.
- **Decision/action:** Adopt as a roadmap criterion.

---

## Tactical patterns (what to build)

### Confidence-based human-in-the-loop routing
- **Origin:** Kshirsagar — 3 Agents XPath. Reinforced by Singh (RCA with confidence + similar defect cite) and Garvanand (LLM-as-Judge with thresholds).
- **What:** The agent labels its own uncertainty. Confidence >=85% auto; 60-84% human review; <60% manual with context notes.
- **Why it matters:** Defines how work is distributed between LLM and human without having to decide it a priori for each case.
- **Decision/action:** Adopt. Every framework output that requires judgment must carry confidence + rationale.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (quality rule #2)

### Static analysis + LLM fallback (no LLM-everywhere)
- **Origin:** Kshirsagar — 3 Agents XPath (Archaeologist = static, Refactor Engine = LLM, Validator = static).
- **What:** Determinism where possible (classification with rules, validation by parallel execution). LLM only where there is real ambiguity.
- **Why it matters:** Reduces cost, latency, and non-determinism surface area.
- **Decision/action:** Adopt as a design rule: justify every LLM use against a deterministic alternative.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (quality rule #3), `qa-framework/parsers/README.md`

### AI Fallback in assertions
- **Origin:** Kastner postmortem.
- **What:** If a traditional selector (Playwright) fails, escalate to the LLM with DOM state for judgment.
- **Why it matters:** Mitigates one of the biggest maintenance costs of E2E.
- **Decision/action:** Prototype. Measure false positives — a permissive LLM says "yes" when something is broken.

### Validation by parallel execution
- **Origin:** Kshirsagar — 3 Agents XPath (Agent 3 Validator).
- **What:** Run original and refactored versions **in parallel** against the same environment and compare pass/fail. The only real guarantee of "zero regression".
- **Why it matters:** For any automatic refactor within the framework (suites, selectors, prompts), independent validation is not optional.
- **Decision/action:** Adopt. Any "auto-migration" must run both sides and report the diff.

### Coverage gap analysis as a PR linter
- **Origin:** Amrutalohabare — AI Coverage Gaps Playwright.
- **What:** GitHub Action that on each PR calls the LLM with tests + user stories and blocks merge if it detects high-risk gaps.
- **Why it matters:** Replicable pattern, immediate value. But the naive implementation (send all tests + gate by keyword) does not scale.
- **Decision/action:** Adopt the idea; redesign with structured output + incremental analysis.

---

## Tooling and technical architecture

### OpenAI-compatible API as a portability layer
- **Origin:** Kshirsagar — Local LLM Pipeline (Ollama/LM Studio).
- **What:** If you build against the OpenAI API spec, local (Ollama) and cloud (OpenAI/Anthropic/etc.) are interchangeable at the config level, not the code level.
- **Why it matters:** For enterprise/regulated clients, the framework MUST be able to run 100% locally. Coupling directly to the Anthropic SDK closes that door.
- **Decision/action:** Adopt. Design the framework against an OpenAI-compatible interface. Wrap the Anthropic SDK behind it if needed.
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (appendix: model selection)

### Local-first as an enterprise requirement (not a workaround)
- **Origin:** Kshirsagar — Local LLM Pipeline.
- **What:** In banking/insurance/healthcare the first security review asks "where does the data go?" and if the answer is "external API", the conversation ends there.
- **Why it matters:** Market positioning. If `qa-framework` cannot run locally, it is excluded from the most solid segment.
- **Decision/action:** Adopt as NF constraint #1. Any feature must be able to work with a local model (even with a quality downgrade).
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (appendix: model selection)

### Model chosen by task, not by organization
- **Origin:** Kshirsagar — Local LLM Pipeline.
- **What:** There is no "best model" — there is a task x size x hardware constraint matrix. Llama 3 8B works for structured JSON, Mistral 7B for classification, Llama 3 70B Q4 for multi-chunk RAG.
- **Why it matters:** Avoids lock-in like "the framework only works with Opus" (anti-pattern observed in Kastner).
- **Decision/action:** Adopt. Declarative matrix of recommended model per task type in the framework.
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (appendix: model selection)

### Model version as part of the contract
- **Origin:** Kastner postmortem.
- **What:** Kastner's framework explicitly depends on Opus 4.6 — Sonnet breaks structured output.
- **Why it matters:** Changing models is breaking, not a bump. You need to version the model x feature matrix.
- **Decision/action:** Adopt a declarative compatibility matrix. Each framework release declares which features are validated against which models.
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (appendix: model selection)

### PromptFoo + DeepEval/RAGAS as a combinable stack
- **Origin:** Kshirsagar — PromptFoo. Reinforced by Garvanand (tooling landscape).
- **What:** PromptFoo (YAML, Git, variant comparison, fast CI) + DeepEval/RAGAS (deep retrieval metrics) together cover what neither covers completely alone.
- **Why it matters:** The framework does not need to reinvent eval; it needs to orchestrate.
- **Decision/action:** Study both before deciding. If the framework adopts PromptFoo as a base, maintain an escape hatch to DeepEval/RAGAS for advanced cases.

### Eval the pipeline, not the model
- **Origin:** Kshirsagar — PromptFoo.
- **What:** PromptFoo targets the RAG pipeline endpoint (retrieval + generation), not the model in isolation. For RAG that is the only correct option.
- **Why it matters:** If the framework exposes "test the LLM", it is the wrong framework. What you test is the complete system.
- **Decision/action:** Adopt. The framework API must target endpoints, not models.

---

## Failure analysis and operational concerns

### Failure analysis with historical RAG + classification taxonomy
- **Origin:** Singh — RAG in test automation.
- **What:** When a test fails, retrieve similar historical failures + previous RCAs + deployments + flaky patterns. Output = classification into 7 categories (Product / Automation / Flaky / Environment / Data / Infra / Third-party) + confidence + similar defect cite.
- **Why it matters:** It is the highest-leverage enterprise use case. Drastically reduces triage time.
- **Decision/action:** Design the framework with failure-analysis as a first-class module, not an add-on.

### Duplicate detection before creating a bug
- **Origin:** Singh — RAG in test automation.
- **What:** Before auto-creating a Jira ticket, compare similarity with existing bugs. Threshold (e.g. 85%) decides create vs. link-and-comment.
- **Why it matters:** Without this, bug creation automation breaks Jira. It is an implicit UX requirement.
- **Decision/action:** Adopt as a requirement of the bug creation module.

### Prompt logging as a non-functional requirement
- **Origin:** Kastner postmortem (`.qa-framework/` directory).
- **What:** Every prompt + every response persisted to disk. Not optional.
- **Why it matters:** Without this, debugging a non-deterministic system is impossible.
- **Decision/action:** Adopt from day 1. Define directory schema + retention policy.

### Severity matches block-severity (in CI)
- **Origin:** Kshirsagar — 3 Pipelines.
- **What:** Pipelines that depend on unstable external services (judge model API) generate a warning, do not block merge. Deterministic pipelines do block.
- **Why it matters:** Without this, an outage of the judge model provider stops the entire organization's merge process.
- **Decision/action:** Adopt. Circuit breaker + severity routing at every gate in the framework.
- **Materialized in:** `qa-framework/architecture/adr-002-playwright-setup.md` (mock blocks, pre warns)

### Living dataset — every prod failure = new golden case
- **Origin:** Kshirsagar — PromptFoo. Reinforced by Garvanand.
- **What:** A static dataset = a signal of abandonment. Every production incident should become a test case in the golden set.
- **Why it matters:** The framework must facilitate this promotion (UX for "promote this failure to permanent golden case").
- **Decision/action:** Adopt. Design an explicit promotion workflow.

### LLM-as-Judge failure modes (checklist)
- **Origin:** Garvanand.
- **What:** Verbosity bias (rewards length), self-serving bias (same family inflates scores), vague rubrics ("is this good?" = useless), missing ground truth.
- **Why it matters:** Without explicit countermeasures, judge scores are theater, not measurement.
- **Decision/action:** Adopt as a mandatory checklist before putting any LLM-as-Judge into production within the framework.

---

## Workflow / build-time concerns

### Strict convention contract > descriptive guidelines
- **Origin:** Nesvitii — MCP + Playwright + Jira E2E Automation.
- **What:** Explicit prohibitive rules in a conventions file ("CSS class selectors: PROHIBITED", "ONLY use data-testid") produce ~95% agent compliance. Descriptive guidelines ("prefer data-testid selectors") produce ~70%. Nesvitii discovered this iterating 3 attempts: system prompt (~70%) -> few-shot examples (~85%) -> strict AGENTS.md + DOM inspection (~98%).
- **Why it matters:** The framework's test-conventions parser extracts patterns from existing tests, but the *format* of the output matters as much as the *content*. An output that says "preferred locator: getByTestId (80%)" does not constrain the LLM; an output that says "CSS class selectors: PROHIBITED" does.
- **Decision/action:** Adopt. The test-conventions parser output must generate prohibitive rules, not descriptive statistics. Reformulate extracted conventions as a strict contract before injecting them into the generation prompt.
- **Materialized in:** `qa-framework/parsers/test-conventions/README.md` (output format: strict contract with bad/good examples)

### Normalisation step for freeform inputs (pre-pipeline)
- **Origin:** Nesvitii — MCP + Playwright + Jira E2E Automation.
- **What:** Before the main pipeline, a cheap dedicated LLM call (Sonnet, max_tokens 1000) converts the freeform Jira ticket (Gherkin, bullets, prose — each engineer writes differently) to structured JSON: `{assertions[], preconditions[], userRole, feature}`. The main agent receives clean requirements and does not have to interpret format.
- **Why it matters:** Separates *parsing* from *reasoning*. The main pipeline never sees ambiguous input. It is the LLM equivalent of "sanitize input" — not optional, it is hygiene. Additionally, it allows validating extraction quality before spending tokens on generation.
- **Decision/action:** Adopt. The framework's Jira parser should be implemented as a normalisation step with a dedicated LLM call. Spec draft in `qa-framework/parsers/jira/README.md`. In QAAP, it fits as a sub-stage of Stage 1 (Parse) using the task type `classification` (small/fast model).
- **Materialized in:** `qa-framework/parsers/jira/README.md` (spec draft), `qaap/documentation/llm-pipeline-spec.md` (Stage 1b: Normalize)

### Observation-based debug loop (screenshot + DOM state)
- **Origin:** Nesvitii — MCP + Playwright + Jira E2E Automation.
- **What:** When a generated test fails, instead of retrying with the error message as the only input (inference), the agent: (1) navigates with a headed browser to the failure point, (2) executes steps up to the failure, (3) takes a screenshot + inspects DOM state, (4) passes visual evidence + actual state to the LLM for the fix. Maximum 3 attempts. Reports fixes "almost always correct on the first attempt".
- **Why it matters:** Kastner's debug loop is "run again with better prompt" — pure inference. Nesvitii's is "run again with evidence from the DOM" — observation. It is a qualitative leap: the fix is based on what actually exists on the page, not on what the LLM infers from the error message. Directly applies to the "Validation loop + Self-healing" item that is in genuinely-new in STATUS.md.
- **Decision/action:** Adopt. Document as a pattern of the framework's validation loop. In QAAP, integrate into Stage 6 (Auto-codification) as post-codification retry.
- **Materialized in:** `qa-framework/protocol/v0.1-generation-protocol.md` (step 8: Validation Loop), `qaap/documentation/llm-pipeline-spec.md` (Stage 6c: Validation Loop)

### Build-time vs run-time separation (MCP)
- **Origin:** Sanaev — Playwright MCP. Reinforces Kastner regression-vs-exploratory.
- **What:** Playwright MCP is for the QA inspecting the app in their IDE. Playwright CLI runs the final test in CI without MCP.
- **Why it matters:** Do not couple the test runner's production to an inspection protocol. That boundary defines what belongs to `qa-framework-cli` vs. an eventual `qa-framework-explorer`.
- **Decision/action:** Adopt as a package/binary separation.
- **Materialized in:** `qa-framework/architecture/adr-001-framework-form.md` (skill-first = build-time; Playwright CLI = run-time)
