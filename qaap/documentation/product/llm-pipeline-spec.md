# QAAP — LLM Pipeline Specification

## Overview

The LLM pipeline is the core intelligence layer of QAAP. It handles context collection, feature discovery, test plan generation, scenario creation, human-in-the-loop review, auto-codification, and failure analysis. Every LLM interaction follows the same patterns: OpenAI-compatible API, structured output with confidence, and mandatory prompt logging.

**Key design decisions (2025-06-11):**
- Connectors are "dumb" — they only collect raw data. ALL interpretation is done by LLM. Projects can be structured in a thousand different ways; deterministic parsing cannot handle this diversity.
- **qaap-engine** is a top-level module (`qaap/engine/`) — a state machine where each state transition launches an LLM agent. The engine itself contains zero LLM logic; agents do all the thinking.
- Agents write results directly to DB as they work. SPA subscribes via Supabase Realtime for live updates — features, test areas, and scenarios appear one by one as the agent discovers them.

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
  | "extraction"       // Feature/test-plan/scenario extraction from raw context
  | "classification"   // Quick categorization (failure type, impact area)
  | "generation"       // Primary Gherkin generation (needs best reasoning)
  | "review"           // Second opinion review (should differ from generator)
  | "codification"     // Gherkin -> test code (needs code generation strength)
  | "failure_analysis" // RCA from execution failures
  | "chat";            // Human-in-the-loop conversation

// Default model matrix (tenant can override per task)
const DEFAULT_MATRIX: Record<TaskType, ModelRef> = {
  extraction:       { provider: "anthropic", model: "claude-sonnet-4-20250514" },
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
  result: T;              // The actual output (features, scenarios, code, etc.)
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

## qaap-engine: State Machine Architecture

The engine (`qaap/engine/`) is a state machine. It does NOT call LLMs directly — it launches agents, and agents do the thinking. Each state transition triggers one or more agents that write results to DB in real-time.

### State Machine

```
queued → collecting → extracting_features → awaiting_feature_review
  → extracting_plans → awaiting_plan_review
  → extracting_scenarios → awaiting_scenario_review
  → ready_for_codification
```

### State → Agent Mapping

```typescript
const STATE_AGENTS = {
  collecting: {
    agent: 'CollectorAgent',
    tools: ['github_api', 'jira_api', 'figma_api'],
    writes: 'raw_chunks',
    next: 'extracting_features',
    parallel: false,
  },
  extracting_features: {
    agent: 'FeatureAgent',
    tools: ['read_chunks', 'search_code', 'read_file', 'save_feature', 'log_progress'],
    writes: 'features',
    next: 'awaiting_feature_review',  // or extracting_plans if auto-approve
    parallel: false,
  },
  extracting_plans: {
    agent: 'PlanAgent',
    tools: ['read_chunks', 'read_features', 'save_test_area', 'log_progress'],
    writes: 'test_areas',
    next: 'awaiting_plan_review',
    parallel: true,                    // 1 agent per approved feature
    parallelKey: 'feature_id',
  },
  extracting_scenarios: {
    agent: 'ScenarioAgent',
    tools: ['read_chunks', 'read_test_areas', 'save_scenario', 'log_progress'],
    writes: 'scenarios',
    next: 'awaiting_scenario_review',
    parallel: true,                    // 1 agent per approved test area
    parallelKey: 'test_area_id',
  },
};
```

### Engine Core (stateless orchestrator)

```typescript
async function tick(jobId: string) {
  const job = await db.getJob(jobId);
  const config = STATE_AGENTS[job.status];
  if (!config) return; // paused state, waiting for human

  if (config.parallel) {
    const items = await db.getApproved(config.parallelKey, jobId);
    await Promise.all(
      items.map(item => launchAgent(config.agent, {
        jobId, targetId: item.id, tools: config.tools,
      }))
    );
  } else {
    await launchAgent(config.agent, { jobId, tools: config.tools });
  }
}
```

### Agent Execution (agentic loop with tool use)

Each agent is an LLM call with tools. The agent decides what to explore and writes results to DB as it discovers them — the SPA sees updates in real-time via Supabase Realtime.

```typescript
async function launchAgent(agentType: string, params: AgentParams) {
  const tools = buildTools(params.tools);
  let messages = [{ role: 'user', content: buildContext(params) }];

  while (true) {
    const response = await llmClient.chat({
      model: router.resolve('extraction'),
      system: AGENT_PROMPTS[agentType],
      messages,
      tools,
    });

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const result = await executeTool(block, params.jobId);
        // executeTool writes to DB → Supabase Realtime → SPA sees it
        messages.push(/* tool_result */);
      }
    }

    if (response.stop_reason === 'end_turn') break;
  }
}
```

### Agent Tools (write to DB = real-time SPA updates)

```typescript
const AGENT_TOOLS = {
  save_feature:   (p) => db.insertFeature(p.jobId, p.feature),    // → SPA sees new feature
  save_test_area: (p) => db.insertTestArea(p.jobId, p.testArea),  // → SPA sees new area
  save_scenario:  (p) => db.insertScenario(p.jobId, p.scenario),  // → SPA sees new scenario
  log_progress:   (p) => db.insertLog(p.jobId, p.message),        // → SPA sees status
  read_chunk:     (p) => db.getChunk(p.jobId, p.chunkType),       // read-only
  search_code:    (p) => db.searchChunks(p.jobId, p.query),       // read-only
};
```

### Human Checkpoint → Re-enqueue

When a state is `awaiting_*_review`:
1. SPA shows approve/reject UI per item
2. Human approves → Edge Function updates job status
3. Edge Function sends message to queue (pgmq)
4. Engine picks up the job and runs the next state's agent(s)

### Real-Time SPA Experience

```
User clicks "Process"
  │
  ▼ SPA subscribes to Supabase Realtime on job tables
  │
  │  "Connecting to GitHub..."        ← agent_logs INSERT
  │  "GitHub connected ✓ 12 chunks"   ← raw_chunks INSERTs
  │  "Connecting to Jira..."          ← agent_logs INSERT
  │  "Jira connected ✓ 8 chunks"     ← raw_chunks INSERTs
  │
  │  "Analyzing project structure..."  ← agent_logs INSERT
  │  Feature: Code (92%)              ← features INSERT
  │  Feature: Issues (88%)            ← features INSERT
  │  Feature: Pull Requests (85%)     ← features INSERT
  │
  │  [Approve All] [Review]           ← status = awaiting_feature_review
  │
  │  User approves →
  │
  │  "Analyzing feature: Code..."      ← agent_logs INSERT
  │    Test Area: Branch List (90%)    ← test_areas INSERT
  │    Test Area: File List (87%)      ← test_areas INSERT
  │  "Analyzing feature: Issues..."    ← parallel agent
  │    Test Area: Issue Board (85%)    ← test_areas INSERT
  │  ...
```

---

## Pipeline Stages

### Stage 0: Collect (Connectors — Deterministic, I/O only)

Connectors are "dumb" data collectors. They do NOT interpret, parse, or classify — they only fetch raw data and chunk it for downstream LLM consumption. Every project is structured differently; deterministic parsing cannot handle this diversity.

```typescript
interface ConnectorOutput {
  source: string;           // "github", "jira", "figma"
  rawChunks: RawChunk[];
}

interface RawChunk {
  type: string;             // "file_tree", "ticket", "frame", "pr", "branch", etc.
  content: string;          // raw content as-is
  metadata: Record<string, unknown>;
}
```

**GitHub connector** dumps:

```
chunk: file_tree        -> "backend/, frontend/, schemas/, scripts/, docs/..."
chunk: readme           -> full README.md content
chunk: branch_list      -> ["main", "develop", "feature/insights", ...]
chunk: recent_prs       -> [{title, description, files_changed}, ...]
chunk: open_issues      -> [{title, labels, body}, ...]
chunk: workflows        -> ["ci.yml", "deploy.yml", ...]
chunk: package_json     -> dependencies, scripts
chunk: tag_list         -> ["v1.0.0", "v1.1.0", ...]
chunk: deployments      -> [{environment, status, url}, ...]
```

**Jira connector** dumps:

```
chunk: epic             -> {title, description, children: [...stories]}
chunk: story            -> {title, description, acceptance_criteria, labels}
chunk: board_config     -> {columns, swimlanes}
chunk: sprint           -> {name, goal, issues}
chunk: component_list   -> [{name, description, lead}]
```

**Figma connector** dumps:

```
chunk: page             -> {name, frames: [{name, children, bounds}]}
chunk: component_set    -> {name, variants: [...]}
chunk: prototype        -> {flows: [{start, connections}]}
chunk: design_tokens    -> {colors, typography, spacing}
```

Each connector registers its chunk types, but the LLM handles ALL semantic interpretation.

### Stage 1: Extract Features (LLM)

The LLM receives ALL raw chunks from ALL connected sources and identifies the high-level features of the application.

```
Prompt: "Here are raw dumps from [GitHub, Jira, Figma] for a project.
         Identify the high-level features of this application.
         For each feature, indicate which sources you inferred it from
         and your confidence."

Input:  all rawChunks from all connectors
Output: Feature[] with confidence + rationale + source_refs
```

**Example** (using a GitHub repo like waveconomy as illustration):

```
Input chunks:
  github/file_tree:    "backend/, frontend/, schemas/, scripts/, docs/..."
  github/branch_list:  ["main", "develop", "feature/insights", ...]
  github/recent_prs:   [{title: "fix: insights empty state"}, ...]
  github/open_issues:  [{title: "Sector leaderboard pagination", labels: ["bug"]}, ...]
  jira/epic:           {title: "Company Evaluation Flow", children: [...]}
  figma/page:          [{name: "Dashboard"}, {name: "Company Detail"}, {name: "Insights"}]

LLM output:
  features:
    - name: "Code"
      description: "Repository code browsing, file navigation, branch/tag management"
      source_refs: [github/file_tree, github/branch_list]
      confidence: 0.92

    - name: "Issues"
      description: "Issue tracking, filtering, labeling"
      source_refs: [github/open_issues, jira/epic]
      confidence: 0.88

    - name: "Pull Requests"
      description: "PR creation, review, merge workflow"
      source_refs: [github/recent_prs]
      confidence: 0.85
```

**Task type:** `extraction` — needs a capable model, not a cheap classifier. The LLM must understand diverse project structures.

**Human checkpoint:** Features with confidence < 0.85 are flagged for review before proceeding. User can add, remove, or rename features.

### Stage 2: Extract Test Plans (LLM, per feature)

For each approved feature, the LLM identifies the testable areas within it.

```
Prompt: "For the feature '{name}', with this raw context,
         identify the testable areas. Each area should be a
         concrete aspect that needs test coverage."

Input:  rawChunks relevant to this feature + feature description
Output: TestArea[] with confidence + rationale
```

**Example** for feature "Code":

```
LLM output:
  test_areas:
    - name: "Branch List"
      description: "Branch browsing, creation, deletion, switching, protection"
      source_refs: [github/branch_list, jira/story:"Branch management"]
      confidence: 0.90

    - name: "File List"
      description: "File tree navigation, file viewing, search"
      source_refs: [github/file_tree, figma/frame:"File Browser"]
      confidence: 0.87

    - name: "Tag List"
      description: "Tag creation, deletion, release association"
      source_refs: [github/tag_list]
      confidence: 0.82

    - name: "Deployments"
      description: "Deployment viewing, rollback, environment management"
      source_refs: [github/deployments]
      confidence: 0.75
```

**Task type:** `extraction`

**Human checkpoint:** Same confidence-based routing. User validates areas before scenario generation.

### Stage 3: Extract Scenarios (LLM, per test area)

For each approved test area, the LLM generates concrete test scenarios.

```
Prompt: "For the area '{name}' of feature '{feature}',
         generate concrete test scenarios in Gherkin.
         Use only information you can back with the provided context."

Input:  rawChunks relevant + feature + test area
Output: Scenario[] with confidence + rationale
```

**Example** for test area "Branch List" of feature "Code":

```
LLM output:
  scenarios:
    - name: "Add branch"
      gherkin: |
        Scenario: Create a new branch from main
          Given I am on the repository code page
          And the branch selector shows "main" as current branch
          When I click the branch selector
          And I type "feature/new-feature" in the search field
          And I click "Create branch: feature/new-feature from main"
          Then the branch selector should show "feature/new-feature"
          And the branch list should contain "feature/new-feature"
      confidence: 0.88
      source_refs: [github/branch_list, jira/story:"Branch creation"]

    - name: "Delete branch"
      gherkin: |
        Scenario: Delete a merged branch
          Given I am on the branches page
          And "feature/old" branch is listed with status "merged"
          When I click the delete button for "feature/old"
          And I confirm the deletion
          Then "feature/old" should not appear in the branch list
      confidence: 0.82
      source_refs: [github/branch_list]

    - name: "Switch branch"
      ...

    - name: "Add tag"
      ...
```

**Task type:** `extraction` for initial generation, then follows the existing generation pipeline principles:
- Properties over content in assertions
- Confidence + rationale mandatory
- One scenario per flow
- Gherkin standard (Cucumber-compatible)

**Human checkpoint:** Same confidence-based routing. This feeds into the existing review stage.

### The Three-Level Hierarchy

```
Feature (high-level capability)
  e.g., "Code", "Issues", "Pull Requests"
    │
    └── TestArea (testable area within the feature)
         e.g., "Branch List", "File List", "Tag List", "Deployments"
           │
           └── Scenario (concrete test case)
                e.g., "Add branch", "Delete branch", "Switch branch"
```

Each level carries:
- `confidence` — drives routing (auto-approve / human review / manual)
- `rationale` — why this confidence
- `source_refs` — which connector chunks backed this extraction
- `coverage` — which connectors contributed (`{ code: true, spec: true, design: false }`)

**Coverage gaps are valuable output**: A feature in GitHub but not in Jira = code without spec. A feature in Jira + Figma but not in GitHub = not yet implemented. A feature in all 3 = high confidence, max priority for tests.

---

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

#### 6a. DOM Inspection (optional — requires running environment)

If the plan has a `targetEnvironment.url` configured:
1. Navigate to the route under test via Playwright
2. Extract all `data-testid` attributes from the relevant DOM region
3. Build a **ground-truth selector map**: which elements actually exist and what they're called
4. Merge with testIds from source code parser (source may miss dynamic/third-party testIds)

This eliminates selector hallucination. Without DOM inspection: ~85% selector accuracy. With it: ~98%.
(Origin: Nesvitii — Playwright MCP DOM inspection pattern)

#### 6b. Code Generation

1. Build prompt with: Gherkin text + target framework + project conventions (as strict contract) + available testIds (source + DOM) + OpenAPI context
2. LLM generates test code
3. Post-processing validates:
   - Imports are correct for the target framework
   - TestIds used exist in source or DOM (if connectors active)
   - TypeScript compilation check (for Playwright/Cypress)
4. Confidence assigned based on evidence ratio (testId-backed locators vs. inferred)
5. Each selector tagged with evidence source: `source-code`, `dom-live`, or `inferred`

#### 6c. Validation Loop (optional — requires running environment)

If the test can be executed against a running environment:
1. Run the generated test
2. If all tests pass -> done (confidence boost +13%)
3. If tests fail -> **observation-based debug**:
   - Navigate to failing URL with headed browser
   - Execute steps up to the point of failure
   - Take screenshot + inspect DOM state at moment of failure
   - Compare expected selector vs what actually exists in the DOM
   - Feed evidence (screenshot + DOM snapshot + error message) to LLM for fix
   - Apply fix and retry
4. Max 3 retry attempts. If still failing after 3: mark as `needs-human-review`

The fix is based on **observation** (real DOM state), not **inference** (interpreting error message alone). This produces correct fixes on the first attempt in most cases.
(Origin: Nesvitii — observation-based debug loop)

If no running environment is available, the validation loop is skipped (degraded mode — lower confidence, no retry).

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

## Full Pipeline Flow

```
Stage 0: Collect       Connectors dump raw data (no interpretation)
           │
           ▼
Stage 1: Features      LLM identifies high-level features from all sources
           │
           ▼  ◄── human checkpoint (confidence-based)
Stage 2: Test Plans    LLM identifies testable areas per feature
           │
           ▼  ◄── human checkpoint (confidence-based)
Stage 3: Scenarios     LLM generates Gherkin scenarios per test area
           │
           ▼  ◄── human checkpoint (confidence-based)
Stage 4: Review        Second LLM reviews scenarios (optional)
           │
           ▼
Stage 5: Chat          Human-in-the-loop review and refinement
           │
           ▼
Stage 6: Codify        LLM generates executable test code
           │
           ▼
Stage 7: Analysis      LLM classifies failures post-execution (ongoing)
```

---

## Prompt Templates

Located at `apps/api/src/modules/pipeline/prompts/`:

| Template | Task Type | Stage | Input | Output |
|----------|-----------|-------|-------|--------|
| `extract-features.ts` | extraction | 1 | All rawChunks | Feature[] |
| `extract-test-areas.ts` | extraction | 2 | Feature + relevant chunks | TestArea[] |
| `extract-scenarios.ts` | extraction | 3 | TestArea + Feature + chunks | Scenario[] (Gherkin) |
| `review-plan.ts` | review | 4 | Scenarios + Context | ReviewFeedback per scenario |
| `codify-playwright.ts` | codification | 6 | Scenario + Conventions + TestIds | Playwright test code |
| `codify-cypress.ts` | codification | 6 | Scenario + Conventions + TestIds | Cypress test code |
| `codify-karate.ts` | codification | 6 | Scenario + OpenAPI | Karate feature code |
| `fix-failing-test.ts` | codification | 6c | Error + Screenshot + DOM | Fixed test code |
| `classify-failure.ts` | failure_analysis | 7 | Error + History (RAG) | Classification + RCA |
| `propose-fix.ts` | generation | 7 | Failure patterns + Source code | ProactiveFix proposal |
| `analyze-impact.ts` | classification | — | Changed files + Test plan | Affected scenarios list |

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
