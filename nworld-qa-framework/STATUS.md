# Status — Tasks vs. Existing Artifacts

> Updated: 2026-06-02

---

## Covered by the internal pilot (promote, don't redo)

| Task | Origin artifact | Target file in framework |
|---|---|---|
| PoC: Playwright multi-env setup | ADR 13 (E2E testing) | `architecture/adr-002-playwright-setup.md` |
| Prompt Protocol v1 | Skill `create-e2e-spec` | `protocol/prompt-templates/generate-e2e-spec.md` |
| Parser: OpenAPI → test context | ADR 10 (OpenAPI-driven) | `parsers/openapi/README.md` + `architecture/adr-003-openapi-context.md` |
| XRay/Jira tag integration | ADR 13 (XRay reporter) | `validation/xray-reporter.md` |
| Generation protocol v0.1 | PLAN + full pipeline | `protocol/v0.1-generation-protocol.md` |
| Parser: Source Code (partial) | Skill `create-e2e-spec` (reads components) | `parsers/source-code/README.md` |
| Parser: Test Conventions (partial) | Skill `verify` (detects patterns) | `parsers/test-conventions/README.md` |

## Partial base in research (connect, don't start from scratch)

| Task | Base in research | What's missing |
|---|---|---|
| ADR: Framework architecture | `insights.md` (build-time vs run-time, MCP, layered) | Already resolved: skill-first → `architecture/adr-001-framework-form.md` |
| Investigate ai-qa-framework (Kastner) | 6 citations in insights.md + patterns.md | Code analysis in `references/` |
| Evaluate LLM models | 3 insights (selection by task, versioning, local-first) | Practical benchmark → promote `adr-001` appendix to its own ADR |
| Coverage Planner | Insight "coverage gap analysis as PR linter" | Implementation |

## Genuinely new (create from scratch)

| Task | Note |
|---|---|
| Investigate alternatives (Meticulous, QA Wolf, Shortest, Carbonate, Momentic) | Not investigated |
| Parser: Jira/Story | The pilot does not use Jira as a generation input |
| Context Assembler | Orchestrator that combines parsers — the pilot has isolated skills |
| Prompt Protocol v2 | Evolution of v1 (few-shot, multi-env) — premature |
| Spec Generator (full engine) | Skills are manual; automated engine does not exist |
| Validation loop + Self-healing | Nothing exists for retry with LLM |
| CLI: nfq-e2e | Does not exist |
| CI/CD: GitHub Action | Does not exist |
| Documentation for the team | Does not exist |
