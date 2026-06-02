# nworld-qa-framework

NWorld framework for automatic E2E test generation with Playwright + LLM.

## Framework form

**Skill-first** (see `architecture/adr-001-framework-form.md`): consumed as Claude Code
skills — `.md` files copied to `.claude/commands/` in the target project.
Not a binary, no runtime, no dependencies.

## Generation pipeline

```
Source Code ──┐
OpenAPI spec ─┤──► Context Assembler ──► LLM + Prompt Template ──► Playwright Spec
Jira ticket ──┤                                                        │
Test conventions ┘                                                     ▼
                                                               Validation + XRay
```

Defined in `protocol/v0.1-generation-protocol.md`.

## Structure

```
nworld-qa-framework/
  STATUS.md                    ← Task vs. existing artifact map
  skills/
    generation/                   ← Skills that generate tests and fixtures
      create-e2e-spec.md             Generates Playwright spec from a component
      create-mock-fixture.md          Generates JSON fixture from OpenAPI spec
    scaffolding/                  ← Skills that create the project structure
      create-domain.md               Domain scaffolds
      create-feature.md               Feature with testId by default
      create-component.md             Shared component (rule of 3)
      create-microfrontend.md         MFE wrapper + webpack + eventbus
      create-environment.md           Configmap + Playwright project
    verification/                 ← Validation skills
      verify.md                       Lint + types + tests + architecture
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
    jira/                         ← Extracts ACs and flows from a ticket (placeholder)
    test-conventions/             ← Extracts patterns from existing tests
  validation/                     ← XRay reporter + verify pipeline
```

## Principles

Distilled from `../research/insights.md` and `../research/patterns.md`:

1. **Properties over content** — Assertions on properties (visible, count, enabled), not literal text
2. **Static analysis first** — Determinism where possible; LLM only where there is real ambiguity
3. **Build-time vs run-time** — Skills to generate; Playwright CLI to execute. They don't mix
4. **Local-first** — The framework runs where the dev works. No external server, no API to audit
5. **Confidence + rationale** — Every LLM output carries confidence + justification, not bare judgment

## Origin of decisions

Every design decision traces back to an entry in `../research/insights.md` or
`../research/patterns.md`. Each ADR explicitly cites its origins.

The QA technical material comes from an internal pilot where test and fixture
generation skills were validated. See `STATUS.md` for the full map.
