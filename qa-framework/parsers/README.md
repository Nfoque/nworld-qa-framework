# Parsers

Parsers are the first phase of the generation pipeline (see `protocol/v0.1-generation-protocol.md`).
Each parser extracts relevant information from one type of input and formats it as context
for the generation prompt.

## The 4 parsers

| Parser | Input | Output (context) | Status |
|---|---|---|---|
| **[Source Code](source-code/)** | Path to component or feature | testIds, interactions, routes, API calls | Partial — base in `create-e2e-spec` skill |
| **[OpenAPI](openapi/)** | Backend YAML/JSON spec | endpoints, schemas, error responses | Partial — base in [ADR-003](../architecture/adr-003-openapi-driven.md) |
| **[Jira/Story](jira/)** | Jira ticket key | assertions, preconditions, userRole, feature | Spec draft — normalisation step strategy defined |
| **[Test Conventions](test-conventions/)** | Existing `e2e/` directory | strict convention contract (prohibitive rules) | Partial — base in `verify` skill |

## Design principle

**Static analysis first** (`research/insights.md`): Parsers are deterministic where possible.
Source Code, OpenAPI, and Test Conventions parsers extract information by reading files,
AST parsing, or grep — no LLM needed.

**Exception: Jira/Story parser.** Jira ticket descriptions are freeform (Gherkin, bullets,
prose — every engineer writes differently). This is where LLM use is justified: a dedicated,
cheap normalisation call (classification task type) converts freeform text to structured JSON
before the main pipeline sees it. See `jira/README.md` for details.

## Combined schema

The Context Assembler receives the output from all parsers in this structure:

```typescript
interface GenerationContext {
  sourceCode: SourceCodeContext;              // required
  openapi: OpenAPIContext | null;             // optional
  jira: JiraContext | null;                   // optional (normalised JSON from LLM call)
  conventions: ConventionsContext | null;     // optional (strict contract format)
  domLive: DomLiveContext | null;             // optional (from DOM inspection step)
}
```

Each parser defines its schema in its own README. Only `sourceCode` is required —
the others enrich the context but their absence does not block generation.
`domLive` comes from the optional DOM inspection step (not a parser — see protocol).

## Context Assembler

The orchestrator that combines parser outputs into a complete prompt does not exist yet.
It is a genuinely new task (see `STATUS.md`). Its role:

1. Execute the available parsers (not all are required)
2. Format the outputs into a structured prompt
3. Pass the prompt to the generation template (`protocol/prompt-templates/generate-e2e-spec.md`)
