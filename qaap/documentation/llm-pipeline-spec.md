# QAAP — LLM Pipeline Specification

## Overview

The LLM pipeline is the core intelligence layer of QAAP. It handles context ingestion, test plan generation, second opinion review, human-in-the-loop chat, auto-codification, and failure analysis. Every LLM interaction follows the same patterns: OpenAI-compatible API, structured output with confidence, and mandatory prompt logging.

---

## Architecture: Three Components

### 1. LLM Client

A thin HTTP wrapper over the OpenAI-compatible `/v1/chat/completions` endpoint. No SDK dependency — only `fetch`.

```typescript
interface LLMClient {
  chat(params: {
    messages: Message[];
    model: string;
    responseFormat?: { type: "json_schema"; schema: ZodSchema };
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<LLMResponse>;
}

interface LLMResponse {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}
```

The client talks to:
- **LiteLLM** (recommended gateway): Single OpenAI-compatible endpoint that routes to 100+ providers. Handles retries, fallbacks, rate limiting.
- **Direct providers**: Any OpenAI-compatible API (Anthropic, OpenAI, Google via LiteLLM, Ollama for local).

For on-prem deployments without external API access: point at Ollama directly.

### 2. LLM Router

Resolves which provider + model to use for a given task type. Configuration is per-tenant (stored in `LLMProviderConfig`).

```typescript
type TaskType =
  | "classification"    // Quick categorization (failure type, impact area)
  | "generation"        // Primary Gherkin generation (needs best reasoning)
  | "review"            // Second opinion review (should differ from generator)
  | "codification"      // Gherkin → test code (needs code generation strength)
  | "failure_analysis"  // RCA from execution failures
  | "chat";             // Human-in-the-loop conversation

// Default model matrix (tenant can override per task)
const DEFAULT_MATRIX: Record<TaskType, ModelRef> = {
  classification:   { provider: "openai",    model: "gpt-4o-mini" },
  generation:       { provider: "anthropic", model: "claude-sonnet-4-20250514" },
  review:           { provider: "google",    model: "gemini-2.5-pro" },
  codification:     { provider: "anthropic", model: "claude-sonnet-4-20250514" },
  failure_analysis: { provider: "anthropic", model: "claude-sonnet-4-20250514" },
  chat:             { provider: "anthropic", model: "claude-sonnet-4-20250514" },
};
```

**Design principle from research**: Model chosen per task (small/fast for classification, large/capable for generation). Model version is part of the contract — a model update is a breaking change, not a bump.

### 3. Prompt Logger

Wraps every LLM call. Records the full prompt, response, model version, latency, token counts, and `promptHash` (SHA-256 of prompt template + variables for tracking prompt drift).

**This is a day-1 non-functional requirement** (from Kastner postmortem in `research/insights.md`): non-deterministic systems require prompt logging for debugging and reproducibility.

---

## Standard Output Schema

Every LLM call in QAAP returns a structured response:

```typescript
interface LLMTaskResult<T> {
  result: T;              // The actual output (Gherkin, code, classification, etc.)
  confidence: number;     // 0.0 - 1.0
  rationale: string;      // Why this confidence score
  model: string;          // Full model ID used
  tokensUsed: {
    input: number;
    output: number;
  };
  latencyMs: number;
  promptHash: string;     // For drift tracking
}
```

**Confidence thresholds** (from `research/patterns.md`, 5 independent sources converge):
- **>= 0.85**: Auto-approve (green in UI)
- **0.60 - 0.84**: Human review recommended (amber in UI)
- **< 0.60**: Manual review required, marked with `// TODO: review` (red in UI)

---

## Pipeline Stages

### Stage 1: Parse (Deterministic — No LLM)

Static analysis runs first. LLM only enters where there is ambiguity. This is the "static analysis first" principle from Kshirsagar + Kastner research.

```
Source Code Parser  → testIds, routes, interactions, component tree
OpenAPI Parser      → endpoints, request/response schemas, error codes, pagination
Jira/Ticket Parser  → acceptance criteria, user flows, labels, linked tickets
Document Parser     → requirements text (chunked for LLM context window)
Convention Parser   → existing test patterns, import conventions, what's already covered
```

Each parser produces a typed `ParseResult` that feeds into the assembler. Parsers are independent — they can run in parallel.

**Existing base from nworld-qa-framework:**
- Source Code Parser: partial (from `create-e2e-spec` skill)
- OpenAPI Parser: partial (from `generate-fixtures.js` pilot)
- Jira Parser: placeholder (genuinely new)
- Convention Parser: partial (from `verify` skill)

### Stage 2: Assemble Context

The assembler combines all parser outputs into a structured prompt input:

```typescript
interface GenerationContext {
  planMetadata: {
    name: string;
    description: string;
    modality: "web" | "api" | "ios";
    targetFramework: string;
    targetEnvironment: { name: string; url: string };
  };
  sourceCode?: SourceCodeContext;     // testIds, routes, interactions
  openapi?: OpenAPIContext;           // endpoints, schemas, errors
  tickets?: TicketContext[];          // ACs, flows, linked stories
  documents?: DocumentChunk[];       // Requirements text chunks
  conventions?: ConventionContext;    // Existing test patterns to follow
  existingScenarios?: string[];      // Previously approved scenarios (for incremental generation)
}
```

The assembler handles:
- **Context window management**: Prioritize information that fits within the model's context. Drop lowest-value chunks first (convention examples > full source code).
- **Deduplication**: Merge overlapping information from multiple sources.
- **Formatting**: Convert to a structured prompt that maximizes LLM output quality.

### Stage 3: Generate (Primary LLM)

Prompt template: `generate-gherkin.ts`

Input: `GenerationContext`
Output: `TestScenario[]` — each with Gherkin text, confidence, and rationale.

**Key principles embedded in the prompt:**
1. **Properties over content** in assertions: assert visibility, count, enabled state — not specific text values (from 5 independent research sources)
2. **Confidence + rationale**: every scenario must include why the LLM is (or isn't) confident
3. **Real testIds only**: never invent testIds — use only those found by the parser
4. **One scenario per flow**: each scenario tests one user flow end-to-end
5. **Gherkin standard**: Feature/Scenario/Given/When/Then format, Cucumber-compatible

### Stage 4: Second Opinion (Optional)

A separate LLM reviews the generated scenarios. Uses a different model (configured in tenant's model matrix).

Prompt template: `review-plan.ts`

Input: Generated scenarios + original context
Output: Review feedback per scenario (missing cases, incorrect assumptions, redundancies)

**Implementation: BullMQ job chain**
1. Job `generate-plan` runs with primary model, produces Gherkin scenarios
2. On completion, enqueues `review-plan` with a different model
3. `review-plan` receives generated plan + original context, produces review feedback
4. Results merged and presented to user with provenance (which model said what)

The UI shows provenance: "Generated by Claude Sonnet 4" / "Reviewed by Gemini 2.5 Pro".

### Stage 5: Human Review (Chat)

NotebookLM-style chat interface. The QA expert can:
- Ask questions about the plan ("Why does scenario 4 have low confidence?")
- Request changes ("Add a negative case for expired credit card")
- Get information about the project ("What endpoints does the checkout API expose?")

The chat context builder assembles:
- Current plan state (all scenarios with their status)
- Original context sources
- Conversation history
- Any review feedback from Stage 4

Applied changes are tracked: each assistant message records which scenarios were modified.

### Stage 6: Auto-Codification

Prompt templates: `codify-playwright.ts`, `codify-cypress.ts`, `codify-karate.ts`

For each approved scenario:
1. Build prompt with: Gherkin text + target framework + project conventions + available testIds + OpenAPI context
2. LLM generates test code
3. Post-processing validates:
   - Imports are correct for the target framework
   - TestIds used exist in source (if source code connector active)
   - TypeScript compilation check (for Playwright/Cypress)
4. Confidence assigned based on evidence ratio (testId-backed locators vs. inferred)

**Each framework has its own prompt template** because the idioms differ significantly. This is not a "template with a framework variable" — each prompt understands its target framework deeply.

### Stage 7: Failure Analysis (Post-Execution)

Prompt template: `classify-failure.ts`

When a test execution fails, the failure analyzer:
1. Embeds the failure context (error message, stack trace, screenshot description, test code, related historical failures)
2. Queries pgvector for similar past failures (RAG)
3. LLM classifies using the 7-category taxonomy (from Singh's research):
   - **product**: Actual bug in the application under test
   - **automation**: Bug in the test itself
   - **flaky**: Non-deterministic failure
   - **env**: Environment-specific issue
   - **data**: Test data problem
   - **infra**: Infrastructure/deployment issue
   - **third_party**: External dependency failure
4. LLM generates RCA (root cause analysis) with confidence
5. Historical failure + RCA stored as embedding for future RAG queries

**Living dataset**: Each classified failure enriches the RAG knowledge base, making future classifications more accurate.

---

## Prompt Templates

Located at `apps/api/src/modules/pipeline/prompts/`:

| Template | Task Type | Input | Output |
|----------|-----------|-------|--------|
| `generate-gherkin.ts` | generation | GenerationContext | TestScenario[] with Gherkin |
| `review-plan.ts` | review | Scenarios + Context | ReviewFeedback per scenario |
| `codify-playwright.ts` | codification | Scenario + Conventions + TestIds | Playwright test code |
| `codify-cypress.ts` | codification | Scenario + Conventions + TestIds | Cypress test code |
| `codify-karate.ts` | codification | Scenario + OpenAPI | Karate feature code |
| `classify-failure.ts` | failure_analysis | Error + History (RAG) | Classification + RCA |
| `propose-fix.ts` | generation | Failure patterns + Source code | ProactiveFix proposal |
| `analyze-impact.ts` | classification | Changed files + Test plan | Affected scenarios list |

Each template is a function that builds the messages array, not a string template. This allows dynamic context assembly and proper role assignment.

---

## Multi-Provider Configuration

Tenants can configure multiple LLM providers simultaneously. The router selects the right one per task.

```
                        ┌──────────────────────────┐
                        │    LLM Router            │
                        │                          │
                        │  taskType ──► model pick  │
                        │  from tenant's matrix    │
                        └──────┬───────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              │                │                    │
     ┌────────▼──────┐ ┌──────▼──────┐ ┌──────────▼────────┐
     │  Primary Gen  │ │  Reviewer   │ │  Classifier        │
     │  (large)      │ │  (large)    │ │  (small/fast)      │
     │               │ │             │ │                    │
     │  Claude 4     │ │  Gemini 2.5 │ │  GPT-4o-mini       │
     │  Sonnet       │ │  Pro        │ │  / Llama 3 8B      │
     │               │ │             │ │  (local)           │
     └──────┬────────┘ └──────┬──────┘ └────────┬───────────┘
            │                 │                  │
            │    All outputs conform to:        │
            │    LLMTaskResult<T>               │
            └─────────────────┴──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Prompt Logger     │
                    │  (every call)      │
                    │  → prompt_logs     │
                    │    table in PG     │
                    └────────────────────┘
```

For on-prem with no external API access:
- Point all tasks at Ollama running locally
- Use appropriate local models (e.g., Llama 3.1 70B for generation, Llama 3.1 8B for classification)
- Same interface, same output schema, same prompt templates
