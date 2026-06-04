# ADR-001: The framework is consumed as Claude Code skills (Skill-first)

> Status: **accepted**
> Date: 2026-06-02

## Context

The framework needs a delivery form: how the team uses it day-to-day.
The options evaluated were:

| Option | Description |
|---|---|
| **CLI** | Standalone binary (`nfq-e2e generate/plan/validate`) |
| **MCP Server** | MCP server exposing tools to the IDE |
| **Skill-first** | Claude Code skills as the primary interface |
| **Hybrid** | Skills for exploration, CLI for CI/CD |

## Decision

**Skill-first.** The framework is distributed as a set of Claude Code skills
(`.md` files in `.claude/commands/`) + prompt templates + documented conventions.

## Evidence

In the internal pilot, 3 QA-relevant skills were validated:

| Skill | What it does | Uses LLM reasoning |
|---|---|---|
| `create-e2e-spec` | Generates Playwright spec from a component + XRay tag | Yes — reads component, infers testIds |
| `create-mock-fixture` | JSON fixture from OpenAPI spec | Yes — parses spec, generates realistic data |
| `verify` | Lint + types + tests + convention validation | No — runs commands |

The skills that use LLM reasoning (`create-e2e-spec`, `create-mock-fixture`) are exactly
the ones the framework needs to scale: test and fixture generation from context.

The pilot also included scaffolding skills (non-QA) that validated that the
skill-first model works well for the team as a delivery form.

## Research principles supporting this

- **Build-time vs run-time** (`research/insights.md`): Skills operate at build-time (the dev generating).
  Playwright CLI operates at run-time (CI executing). They don't mix.
- **Local-first** (`research/insights.md`): The LLM runs where the dev works. No external server,
  no API to audit, no data leaving the laptop.
- **Static analysis + LLM fallback** (`research/insights.md`): Deterministic skills don't need LLM.
  They only escalate to LLM where there is real ambiguity (inferring testIds, generating fixtures).

## Implications

1. The "framework" is not a binary — it's a package of skills + prompt templates + conventions.
2. It's installed by copying `.md` files to `.claude/commands/` of the target project.
3. Updates are text diffs, not software releases.
4. No runtime, no dependencies, no build step.
5. Quality depends on prompt quality, not executable code.

## Future

If headless execution in CI/CD is needed (without interactive Claude Code), a lightweight CLI
is extracted **from the skills** — the prompt templates are reused as system prompts for a CLI
that calls the Anthropic API. But this is P2, not the starting point.

## Origin

- QA skills tested: internal pilot (`create-e2e-spec`, `create-mock-fixture`, `verify`)
- Insights: `research/insights.md` (build-time vs run-time, local-first, static + LLM)
- Patterns: `research/patterns.md` (build-time vs run-time separation)

---

## Appendix: Model selection (pending benchmark)

> This appendix captures the design intent regarding LLM model selection.
> It is not an accepted decision — it will be promoted to an independent ADR when
> own benchmarks exist.

Three research insights converge:

1. **Model per task, not per organization** — There is no "best model". Small models
   (7-8B) are sufficient for classification and structured JSON. Large models (70B+, Opus) for
   complex test generation and reasoning.

2. **Model version as part of the contract** — Changing models is breaking, not a
   bump. Each framework release will declare which features are validated against which models.

3. **Local-first as an enterprise requirement** — In banking/insurance/healthcare, "where does the
   data go?" ends the conversation if the answer is "external API". The framework must be able
   to run with a local model (with accepted quality downgrade).

### Principles that will guide the matrix

- Justify each LLM use against a deterministic alternative.
- OpenAI-compatible API as a portability layer (Ollama and Anthropic interchangeable via config).
- Each release declares validated models — not "compatible with any LLM".

### To promote to ADR

- Benchmark: generate spec (Opus vs Sonnet vs Llama 70B) with compilability and testId accuracy metrics.
- Benchmark: generate fixture (Sonnet vs Llama 8B) with schema compliance metrics.
- Validate OpenAI-compatible API with real Ollama.

### Origin

- `research/insights.md` § "Model chosen per task, not per organization"
- `research/insights.md` § "Model version as part of the contract"
- `research/insights.md` § "Local-first as an enterprise requirement"
- `research/patterns.md` § "OpenAI-compatible API as a portability layer"
