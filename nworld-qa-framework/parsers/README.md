# Parsers

Parsers are the first phase of the generation pipeline (see `protocol/v0.1-generation-protocol.md`).
Each parser extracts relevant information from one type of input and formats it as context
for the generation prompt.

## The 4 parsers

| Parser | Input | Output (context) | Status |
|---|---|---|---|
| **[Source Code](source-code/)** | Path to component or feature | testIds, interactions, routes, API calls | Partial — base in `create-e2e-spec` skill |
| **[OpenAPI](openapi/)** | Backend YAML/JSON spec | endpoints, schemas, error responses | Partial — base in ADR 10 |
| **[Jira/Story](jira/)** | Jira ticket key | acceptance criteria, flows | Placeholder — genuinely new |
| **[Test Conventions](test-conventions/)** | Existing `e2e/` directory | patterns, imports, helpers, what's already covered | Partial — base in `verify` skill |

## Design principle

**Static analysis first** (`research/insights.md`): Parsers are deterministic. They extract
information by reading files, AST parsing, or grep — they do not use an LLM. The LLM only
intervenes in the generation phase, when it already has all the assembled context.

## Combined schema

The Context Assembler receives the output from all parsers in this structure:

```typescript
interface GenerationContext {
  sourceCode: SourceCodeContext;              // required
  openapi: OpenAPIContext | null;             // optional
  jira: JiraContext | null;                   // optional
  conventions: ConventionsContext | null;     // optional
}
```

Each parser defines its schema in its own README. Only `sourceCode` is required —
the others enrich the context but their absence does not block generation.

## Context Assembler

The orchestrator that combines parser outputs into a complete prompt does not exist yet.
It is a genuinely new task (see `STATUS.md`). Its role:

1. Execute the available parsers (not all are required)
2. Format the outputs into a structured prompt
3. Pass the prompt to the generation template (`protocol/prompt-templates/generate-e2e-spec.md`)
