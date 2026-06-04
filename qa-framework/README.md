# qa-framework

NWorld framework for automatic E2E test generation with Playwright + LLM.

## Framework form

**Skill-first** (see `architecture/adr-001-framework-form.md`): consumed as Claude Code
skills — `.md` files copied to `.claude/commands/` in the target project.
Not a binary, no runtime, no dependencies.

## Generation pipeline

```
Source Code ──────┐
OpenAPI spec ─────┤
Jira ticket ──────┤──► Context Assembler ──► LLM + Prompt Template ──► Playwright Spec
Test conventions ─┤                                                        │
DOM live (opt.) ──┘                                                        ▼
                                                                   Validation Loop
                                                                   (opt. debug retry)
                                                                        │
                                                                        ▼
                                                                   XRay + PR
```

Defined in `protocol/v0.1-generation-protocol.md` (8 steps: parse → jira normalize → assemble → DOM inspect → generate → post-process → validation loop → report).

## Structure

```
qa-framework/
  STATUS.md                    ← Task vs. existing artifact map
  protocol/
    v0.1-generation-protocol.md   ← Generation pipeline (inputs → output)
    prompt-templates/
      generate-e2e-spec.md        ← Template for generating E2E specs
  architecture/
    adr-001-framework-form.md     ← Decision: skill-first (+ model appendix)
    adr-002-playwright-setup.md   ← Playwright multi-env + XRay
    adr-003-openapi-driven.md     ← OpenAPI as generation input
  parsers/
    openapi/                      ← Extracts endpoints, schemas, errors from spec
    source-code/                  ← Extracts testIds, interactions, routes from component
    jira/                         ← Normalisation step: LLM call converts freeform tickets to structured JSON
    test-conventions/             ← Extracts patterns as strict convention contract (prohibitive rules)
  targets/                        ← Target project validation sequence
  validation/                     ← XRay reporter + verify pipeline
```

> **Note:** The pilot skills (`create-e2e-spec`, `create-mock-fixture`, `verify`, scaffolding skills) that validated the skill-first approach have been archived. Their evidence is captured in `STATUS.md` (section "Covered by the internal pilot") and cited by ADR-001. Executable skills for this repo live in `.claude/skills/`.

## Principles

Distilled from `../research/insights.md` and `../research/patterns.md`:

1. **Properties over content** — Assertions on properties (visible, count, enabled), not literal text
2. **Static analysis first** — Determinism where possible; LLM only where there is real ambiguity
3. **Build-time vs run-time** — Skills to generate; Playwright CLI to execute. They don't mix
4. **Local-first** — The framework runs where the dev works. No external server, no API to audit
5. **Confidence + rationale** — Every LLM output carries confidence + justification, not bare judgment
6. **Strict convention contracts** — Prohibitive rules ("PROHIBITED", "ONLY") produce ~95% LLM compliance vs ~70% for descriptive guidelines
7. **Observation over inference** — Debug loops use DOM state + screenshots, not just error messages

## Origin of decisions

Every design decision traces back to an entry in `../research/insights.md` or
`../research/patterns.md`. Each ADR explicitly cites its origins.

The QA technical material comes from an internal pilot where test and fixture
generation skills were validated. See `STATUS.md` for the full map.
