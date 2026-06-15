# qaap-engine

Standalone Node.js process that processes `engine_jobs` through a series of typed steps. Dockerized, horizontally scalable. Each step has a strict input/output contract (JSONB in DB, TypeScript interfaces for validation). **No domain entities** (TestPlan, TestScenario, etc.) are created until the final proposal is accepted by the user.

> 📘 **Build spec:** [`PIPELINE-EXECUTION-REFERENCE.md`](PIPELINE-EXECUTION-REFERENCE.md) — the end-to-end reference for processing one job (data model, `tick()`/`buildInput()`, per-step contracts & prompts, domain-model mapping, lessons learned, and the Node/Docker build checklist). Derived from a full manual simulation against `ivncmp/clau-lessons`.
>
> 🗺️ **What's next:** [`ROADMAP.md`](ROADMAP.md) — upcoming milestones toward the real engine.

```
qaap/
├── spa/          ← React SPA (viewer only — reads steps, renders output)
├── backend/      ← Supabase (Edge Functions + PostgreSQL + Realtime)
├── engine/       ← THIS — Node.js worker process (Docker)
└── documentation/
```

## Runtime

- **Language:** TypeScript (Node.js)
- **Deployment:** Docker container, independently scalable
- **Queue:** Supabase pgmq — engine polls for jobs
- **LLM calls:** OpenAI-compatible API via fetch (no SDK lock-in)
- **DB access:** Direct PostgreSQL (service role, not through PostgREST)
- **Observability:** Every LLM call logged to `prompt_logs`

## Principles

1. **Steps are pure I/O** — each step reads its `input`, produces `output`, nothing else
2. **Contracts, not tables** — intermediate data lives as JSONB inside `engine_job_steps.output`, not in dedicated tables
3. **Output of step N = input of step N+1** — the engine wires them automatically
4. **100% autonomous** — the pipeline runs from start to finish without human intervention. Users see progress in real-time but cannot interact until the final proposal
5. **SPA is a viewer** — reads `engine_job_steps` via Supabase Realtime, renders `output` per step type. Only at step 5 (proposal) does the user interact
6. **Materialization is the last mile** — only when the user accepts the final proposal do `test_plans`, `test_scenarios`, etc. get created in domain tables

## State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│                         engine_job                                │
│  status: queued → running → completed                            │
│  (no pauses between steps — fully autonomous)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  step 1: collect              [LLM agent + tools]                │
│      ↓ output → input                                            │
│  step 2: extract_features     [LLM]                              │
│      ↓ output → input                                            │
│  step 3: extract_plans        [LLM, parallel per feature]        │
│      ↓ output → input                                            │
│  step 4: extract_scenarios    [LLM, parallel per test area]      │
│      ↓ output → input                                            │
│  step 5: generate_proposal    [aggregation, no LLM]  ← PAUSE    │
│                                                                  │
│  User reviews full proposal (Features + Plans + Scenarios)       │
│  User accepts → materialize into domain tables                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Job Status

| Status | Meaning |
|---|---|
| `queued` | Job created, waiting to start |
| `running` | Engine is executing steps (1 through 4) |
| `paused` | Waiting for user to review the proposal (step 5) |
| `completed` | Proposal accepted and materialized |
| `failed` | Unrecoverable error |
| `cancelled` | User cancelled |

### Step Status

| Status | Meaning |
|---|---|
| `pending` | Not yet started |
| `running` | Currently executing |
| `completed` | Finished successfully, `output` is populated |
| `failed` | Error, see `error_message` |

---

## Step Contracts

### Shared Types

```typescript
interface RawChunk {
  id: string;
  source: string;              // "github", "jira", "figma"
  type: string;                // "file_tree", "ticket", "frame", etc.
  content: string;             // raw content as-is
  metadata: Record<string, unknown>;
}

interface SourceRef {
  chunk_id: string;
  source: string;
  type: string;
}

interface Feature {
  id: string;                  // generated UUID
  name: string;                // "Code", "Issues", "Pull Requests"
  description: string;
  source_refs: SourceRef[];
  confidence: number;          // 0.0 - 1.0
  rationale: string;
  coverage: {                  // which connector types contributed
    [source: string]: boolean; // e.g. { github: true, jira: true, figma: false }
  };
}

interface TestArea {
  id: string;
  feature_id: string;          // FK to parent feature
  name: string;                // "Branch List", "File Navigation"
  description: string;
  source_refs: SourceRef[];
  confidence: number;
  rationale: string;
}

interface Scenario {
  id: string;
  test_area_id: string;        // FK to parent test area
  name: string;                // "Create branch from main"
  gherkin: string;             // full Gherkin text
  source_refs: SourceRef[];
  confidence: number;
  rationale: string;
}

// Every LLM step populates this in meta
interface LLMMeta {
  model: string;               // full model ID used
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  prompt_hash: string;         // SHA-256 for drift tracking
  agents_launched?: number;    // for parallel steps
  cost_usd?: number;           // estimated cost
}
```

---

### Step 1: `collect`

An LLM agent with tools explores the project's data sources (GitHub, Jira, Figma). The agent decides what to look at, how deep to go, and when it has enough context. It collects raw data without interpreting it — interpretation happens in step 2.

```typescript
// Input
interface CollectInput {
  sources: {
    connector_config_id: string;
    type: string;              // "github", "jira", "figma"
    config: Record<string, unknown>; // repo URL, project key, file ID, etc.
  }[];
}

// Output
interface CollectOutput {
  raw_chunks: RawChunk[];
  summary: {
    total_chunks: number;
    by_source: Record<string, number>;  // { github: 12, jira: 8 }
  };
}
```

**Engine logic:** Launch a CollectorAgent with source-specific tools (github_list_tree, github_read_file, jira_list_epics, figma_list_pages, etc.). The agent explores autonomously, calling `save_chunk` as it discovers data and `finish_collection` when done. See `prompts/step-1-collect.md` for the full agent prompt and tool definitions.

---

### Step 2: `extract_features`

LLM receives ALL raw chunks and identifies high-level features.

```typescript
// Input (= step 1 output)
interface ExtractFeaturesInput {
  raw_chunks: RawChunk[];
}

// Output
interface ExtractFeaturesOutput {
  features: Feature[];
  coverage_gaps: {
    description: string;       // "Feature X found in GitHub but not in Jira"
    sources_present: string[];
    sources_missing: string[];
  }[];
}
```

**Engine logic:** Single LLM call with all chunks. Model: `extraction` task type (Sonnet-class).

**Prompt contract:**
- System: "You are a QA analyst. Identify high-level features from raw project data."
- User: all raw_chunks formatted as context
- Response format: JSON matching `ExtractFeaturesOutput`
- Strict rules: confidence + rationale mandatory, source_refs must reference real chunk IDs

---

### Step 3: `extract_plans`

LLM identifies testable areas per feature. Runs in parallel: 1 agent per feature.

```typescript
// Input (= step 2 output)
interface ExtractPlansInput {
  features: Feature[];
  raw_chunks: RawChunk[];      // passed from step 1 for chunk lookups
}

// Output
interface ExtractPlansOutput {
  test_areas: TestArea[];      // all test areas, grouped by feature_id
}
```

**Engine logic:** Launch 1 agent per feature in parallel. Each agent receives the feature + its relevant raw_chunks (from step 1, filtered by source_refs). Results aggregated into a single output.

**Prompt contract:**
- System: "You are a QA analyst. For this feature, identify concrete testable areas."
- User: feature description + relevant raw chunks
- Response format: JSON array of TestArea

---

### Step 4: `extract_scenarios`

LLM generates Gherkin scenarios per test area. Runs in parallel: 1 agent per test area.

```typescript
// Input (= step 3 output)
interface ExtractScenariosInput {
  test_areas: TestArea[];
  features: Feature[];         // passed for context
  raw_chunks: RawChunk[];      // passed from step 1 for chunk lookups
}

// Output
interface ExtractScenariosOutput {
  scenarios: Scenario[];       // all scenarios, grouped by test_area_id
}
```

**Engine logic:** Launch 1 agent per test area. Each agent receives: test area + parent feature + relevant raw chunks. Model: `extraction` task type.

**Prompt contract:**
- System: "You are a QA analyst. Generate concrete Gherkin test scenarios for this test area."
- User: test area + feature + relevant raw chunks
- Response format: JSON array of Scenario
- Strict rules: properties over content in assertions, one scenario per flow, Cucumber-compatible Gherkin

---

### Step 5: `generate_proposal`

Assembles all data into a final structured proposal. No LLM — pure aggregation.

```typescript
// Input (computed from all previous steps)
interface GenerateProposalInput {
  features: Feature[];
  test_areas: TestArea[];
  scenarios: Scenario[];
  coverage_gaps: { description: string; sources_present: string[]; sources_missing: string[] }[];
  stats: {
    total_chunks: number;
    sources_used: string[];
  };
}

// Output
interface ProposalOutput {
  proposal: {
    features: (Feature & {
      test_areas: (TestArea & {
        scenarios: Scenario[];
      })[];
    })[];
    coverage_gaps: { description: string; sources_present: string[]; sources_missing: string[] }[];
    stats: {
      total_features: number;
      total_test_areas: number;
      total_scenarios: number;
      avg_confidence: number;
      sources_used: string[];
    };
  };
}
```

**Engine logic:** Read features (step 2), test_areas (step 3), scenarios (step 4). Nest them into a tree. Calculate stats. This is the last step the engine executes — from here, the SPA takes over.

**SPA takes over:** This is the only step where the SPA is NOT just a viewer. The SPA renders the full proposal tree and lets the user:
- Browse features → test areas → scenarios
- See confidence scores and rationale for every item
- Edit names, descriptions, Gherkin text
- Remove items they don't want
- Map features to TestPlans (rename, merge, split)
- Configure target framework (Playwright, Cypress, Karate)
- **Accept** — the SPA calls an Edge Function that materializes the accepted proposal into domain tables (`test_plans`, `test_scenarios`, etc.) and marks the job as `completed`

---

## Engine Tick Function

```typescript
async function tick(jobId: string) {
  const job = await getJob(jobId);
  const steps = await getSteps(jobId);
  const current = steps.find(s => s.status === 'pending' || s.status === 'running');

  if (!current) return; // nothing to do

  if (current.status === 'pending') {
    // Wire input from previous step's output
    const prev = steps.find(s => s.position === current.position - 1);
    if (prev && !current.input) {
      current.input = buildInput(current.step_type, steps);
    }
    current.status = 'running';
    current.started_at = now();
    await updateStep(current);
  }

  // Execute the step
  try {
    const executor = STEP_EXECUTORS[current.step_type];
    const { output, meta } = await executor(current.input, job);

    current.output = output;
    current.meta = meta;
    current.status = 'completed';
    current.completed_at = now();
    await updateStep(current);

    // If this was the proposal step, pause for user review
    if (current.step_type === 'generate_proposal') {
      job.status = 'paused';
      await updateJob(job);
      return; // SPA takes over
    }

    // Continue to next pending step
    await tick(jobId);
  } catch (error) {
    current.status = 'failed';
    current.error_message = error.message;
    job.status = 'failed';
    job.error_message = `Step ${current.step_type} failed: ${error.message}`;
    await updateStep(current);
    await updateJob(job);
  }
}

// Steps 3 and 4 need data from earlier steps (raw_chunks, features)
// This function builds the correct input by reading from the step chain
function buildInput(stepType: string, steps: Step[]): unknown {
  const getOutput = (pos: number) => steps.find(s => s.position === pos)?.output;

  switch (stepType) {
    case 'collect':
      return getOutput(0); // from job's selected_sources
    case 'extract_features':
      return getOutput(1); // raw_chunks from collect
    case 'extract_plans':
      return {
        features: getOutput(2).features,
        raw_chunks: getOutput(1).raw_chunks,
      };
    case 'extract_scenarios':
      return {
        test_areas: getOutput(3).test_areas,
        features: getOutput(2).features,
        raw_chunks: getOutput(1).raw_chunks,
      };
    case 'generate_proposal':
      return {
        features: getOutput(2).features,
        test_areas: getOutput(3).test_areas,
        scenarios: getOutput(4).scenarios,
        coverage_gaps: getOutput(2).coverage_gaps,
        stats: {
          total_chunks: getOutput(1).summary.total_chunks,
          sources_used: Object.keys(getOutput(1).summary.by_source),
        },
      };
  }
}
```

---

## Step Initialization

When an `engine_job` is created, all 5 steps are pre-created as `pending`:

```typescript
const STEP_SEQUENCE = [
  { position: 1, step_type: 'collect' },
  { position: 2, step_type: 'extract_features' },
  { position: 3, step_type: 'extract_plans' },
  { position: 4, step_type: 'extract_scenarios' },
  { position: 5, step_type: 'generate_proposal' },
];
```

The SPA can show the full pipeline progress from the start — 5 steps, each with a status indicator.

---

## SPA Query

```sql
SELECT
  s.position,
  s.step_type,
  s.status,
  s.output,
  s.meta,
  s.started_at,
  s.completed_at
FROM engine_job_steps s
WHERE s.job_id = :jobId
ORDER BY s.position;
```

The SPA renders each step based on its `step_type` and `status`:
- `pending` → greyed out, "Waiting..."
- `running` → animated, shows progress from meta if available
- `completed` → green, renders `output` with a type-specific component (read-only)
- `failed` → red, shows error

Steps 1-4 are purely informational in the SPA — the user watches progress but cannot intervene. Step 5 is the only interactive step: the SPA renders the full proposal and lets the user edit/accept.

---

## Materialization (SPA → Edge Function)

Step 5 is the handoff point: the engine finishes, the SPA takes control. The user edits the proposal to their liking, then accepts. The SPA calls an Edge Function with the final edited proposal, and the Edge Function creates domain entities:

```
proposal.features    → test_plans      (1 feature = 1 test plan, user may rename/merge)
proposal.test_areas  → (embedded in test plan scope, or context_sources)
proposal.scenarios   → test_scenarios  (1 scenario = 1 row with gherkin + confidence)
proposal.source_refs → context_sources (link back to connector data)
```

The Edge Function also:
- Sets `engine_job.status = 'completed'`
- Sets `engine_job_steps[5].status = 'completed'` with the final accepted proposal as `output`
- Links created `test_plans` back to the `engine_job` for traceability

This is a one-time write. After materialization, the job is done and the user works with standard domain entities (TestPlan, TestScenario) from that point on.

---

## Data Flow Between Components

```
┌──────────────┐     Realtime   ┌──────────────────┐     writes       ┌───────────┐
│   SPA        │◄───────────────│   PostgreSQL     │◄─────────────────│  Engine   │
│  (viewer)    │  subscribes    │  engine_jobs     │  steps + output  │  (Docker) │
│              │  to changes    │  engine_job_steps│                  │           │
│              │                │                  │                  │           │
│  [Proposal]  │────►           │                  │────► pgmq ──────►│  tick()   │
│              │  Edge Function │                  │  job message     │           │
│              │  materializes  │                  │                  │  LLM call │
└──────────────┘                └──────────────────┘                  └───────────┘
```

1. **User creates job** → SPA calls Edge Function → inserts `engine_job` + 5 pending steps → sends pgmq message
2. **Engine polls pgmq** → picks up job → runs `tick()` → executes step 1 (collect)
3. **Step completes** → engine writes `output` to step → updates step status → continues immediately to next step
4. **SPA receives Realtime updates** → re-renders each step as it completes (read-only progress view)
5. **Steps 1→2→3→4→5 run without pause** — fully autonomous
6. **Proposal step completes** → engine writes proposal to step 5 output → job `paused` → SPA shows full proposal editor
7. **User reviews, edits & accepts** → SPA calls Edge Function → EF materializes into domain tables (test_plans, test_scenarios) → job `completed`

## Local PoC Plan

To test the pipeline without building the engine:

1. **Collect raw chunks via LLM agent** — run step 1 prompt against a real repo, save output as JSON
2. **Test prompts via Claude Code** — each extraction step has a corresponding prompt in `prompts/`
3. **Evaluate output quality** — check features, test areas, scenarios for accuracy and confidence
4. **Iterate prompts** — adjust system prompts, add/remove constraints until output is consistent
5. **Simulate the full pipeline** — chain: collect → extract features → extract plans → extract scenarios → assemble proposal

The prompt templates live in `qaap/engine/prompts/` and are the same templates that will be used in the real engine.
