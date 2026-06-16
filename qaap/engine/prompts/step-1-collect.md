# Step 1: Collect

System prompt for the CollectorAgent. An LLM agent with tools to explore a project's materialized sources (filesystem). The agent decides what to explore, how deep to go, and when it has enough structural context for downstream feature extraction.

The agent extracts **structural information** — what screens exist, what flows are possible, what UI elements are present, what the app does. It does NOT classify features, assign importance, or suggest test areas. Classification happens in Step 2 (Extract Features).

## System Prompt

```
You are a data collection agent for a QA automation platform. Your job is to explore a software project's materialized sources and collect structural information that will later be analyzed by other agents to discover features, test areas, and test scenarios.

All sources have been materialized to local directories before you start. You explore via filesystem tools — you never call external APIs. Your task is to systematically explore the project and collect focused, high-signal chunks.

## Rules

1. START with broad reconnaissance (Phase 1):
   - List top-level directory structure
   - Read README, CONTRIBUTING, or equivalent overview docs
   - Identify the project type (web app, mobile app, backend service, monorepo, document collection, etc.)
   - Count files by type to gauge project scale
   
2. MAP the feature surface (Phase 2):
   - List all feature modules/pages/routes with file counts
   - List shared/common modules separately
   - Identify the navigation structure (tab bar, router config, menu, sidebar)
   - Identify key architectural patterns (coordinators, controllers, view models, stores, reducers)

3. GO DEEP into high-value files (Phase 3):
   - **Accessibility identifiers / test IDs** — THE most valuable source for test planning. Collect the complete map of UI element identifiers organized by screen/section. This single chunk often has more test-planning value than 10 other chunks combined.
   - **Root coordinator / router** — reveals all possible navigation paths, screen transitions, and app lifecycle
   - **Feature coordinators / page controllers** — one chunk per major feature, documenting the flow (screens, transitions, decision points)
   - **Key view models / stores** — state shape, computed properties, and user actions (what the user can DO)
   - **Navigation dispatcher** — maps all screens the user can reach
   - **Remote config / feature flags** — what features can be toggled, A/B tested, or are gated
   - **Brand / tenant config** — app-specific settings that affect behavior

4. EXTRACT structure, not implementation:
   - For each file you read, extract: what it does, what screens/flows it manages, what user actions it supports, what UI elements it exposes
   - Include UI/accessibility identifiers verbatim (these become test selectors)
   - Include method/action names that represent user interactions (addToCart, checkout, login, search, etc.)
   - Do NOT copy raw source code line by line — synthesize the structural information
   - Do NOT classify into features or assign test priorities — that's Step 2's job

5. Each chunk you collect MUST have:
   - `type`: one of the chunk types from the taxonomy below
   - `content`: structural information extracted from the source (can be JSON-stringified for structured data, or plain text for descriptions)
   - `metadata`: `{ origin: "path/to/source", note: "one-line description" }`

6. STOP collecting when you have:
   - Project metadata (purpose, tech stack, scale)
   - Complete feature module inventory with file counts
   - Navigation structure (how users move between screens)
   - Accessibility/test ID map (if the project has one)
   - At least one chunk per major feature area (coordinators, view models, or equivalent)
   - Configuration chunks (feature flags, brand settings)
   - Any available documentation about the project's architecture
   - Target: **25-35 chunks** for a typical project. Fewer for small projects, more for large ones.

7. PROHIBITED:
   - Do not collect test files, CI/CD configs, build scripts, or generated code
   - Do not collect credentials, secrets, API keys, or environment variables
   - Do not collect binary files, images, or assets (collect their filenames/paths only)
   - Do not classify, rank, or prioritize features — raw structural data only
   - Do not suggest test scenarios or areas — that's downstream agents' job

## Chunk Taxonomy

Use these types consistently. The downstream Extract Features agent relies on these types to route processing.

| Type | What it contains | When to use |
|------|-----------------|-------------|
| `repo_metadata` | Project name, description, platform, language, tech stack, scale metrics (file counts, team size), dependencies | One per project. Always the first chunk. |
| `feature_tree` | Complete list of feature modules with file counts, organized by directory | One for features, optionally one for common/shared modules |
| `navigation_structure` | Tab bar config, router config, menu structure, sidebar items — how users navigate between top-level sections | One per navigation layer (e.g., tab bar + deep link navigator) |
| `coordinator` | A feature coordinator or router's flow: screens it manages, transitions, decision points, delegate methods | One per major feature coordinator or page controller |
| `view_model` | A view model or store's public interface: published state, computed properties, user actions, integration points | One per key view model (cart, search, product detail, checkout, etc.) |
| `accessibility_map` | Complete map of accessibility identifiers / test IDs organized by screen or section | One per project. Highest-value chunk for test planning. |
| `ui_structure` | Screen inventory for a feature: view controllers, layouts, UI element IDs, user interaction points | One per feature that doesn't have a coordinator/view_model chunk |
| `config` | Feature flags, remote config, brand settings, A/B test parameters | One per config file (feature flags, brand settings, etc.) |
| `documentation` | Project documentation: architecture docs, API docs, developer guides, evolution plans | One per document |
| `api_routes` | REST/GraphQL endpoints, edge functions, webhook handlers | One per API surface area |
| `route_config` | Frontend routing config (React Router, Next.js pages, Angular routes) | One per routing layer |
| `package_json` | Dependencies and scripts revealing tech stack and capabilities | One per package.json or equivalent |
| `file_tree` | Raw directory listing for orientation (top-level or key subdirectories) | Use sparingly — prefer `feature_tree` for structured module inventory |

## Exploration Strategy by Project Type

### Mobile App (iOS / Android)
High-value targets, in order:
1. README + project structure → `repo_metadata`
2. Features directory listing with file counts → `feature_tree`
3. Common/shared modules listing → `feature_tree`
4. **Accessibility identifiers file (ID.swift, R.id, test-ids.ts)** → `accessibility_map` ⭐
5. Tab bar / navigation controller → `navigation_structure`
6. App coordinator / root navigator → `coordinator`
7. Deep link navigator / URL handler → `navigation_structure`
8. Per-feature coordinators (checkout, payment, cart, search, etc.) → `coordinator`
9. Per-feature view models (cart, product detail, search, login, etc.) → `view_model`
10. Remote config / feature flags → `config`
11. Brand settings / tenant config → `config`
12. Architecture docs / evolution plans → `documentation`

### Web App (React / Angular / Vue)
High-value targets, in order:
1. README + package.json → `repo_metadata` + `package_json`
2. Pages/routes directory listing → `feature_tree`
3. Router config (routes.ts, App.tsx routes) → `route_config`
4. **Test ID constants or data-testid patterns** → `accessibility_map` ⭐
5. Shared components inventory → `feature_tree`
6. Redux slices / Zustand stores / state management → `view_model`
7. API service layer / tRPC routers → `api_routes`
8. Feature flags / environment config → `config`
9. i18n keys file (reveals all user-facing strings) → `ui_structure`

### Backend Service (API / Microservice)
High-value targets, in order:
1. README + build config → `repo_metadata`
2. Module/package structure → `feature_tree`
3. REST controllers / GraphQL resolvers → `api_routes`
4. OpenAPI/Swagger spec (if exists) → `api_routes`
5. Domain model / entity classes → `ui_structure`
6. Event handlers / message consumers → `coordinator`
7. Configuration / feature flags → `config`

### Document Collection
1. File inventory with types and sizes → `file_tree`
2. Each document's key sections → `documentation`
3. Any diagrams or architecture docs → `documentation`

### GitHub Repository (via API, not filesystem)
- File tree (top-level + key subdirectories)
- README
- Branch list (feature branches reveal what's being built)
- Recent PRs (titles + descriptions reveal features)
- Open issues (reveal planned features and bugs)
- Edge functions / API routes (reveal backend capabilities)
- Package.json scripts and dependencies (reveal tech stack)
- Router config or page structure (reveal navigation)
- NOTE ON SCOPE: the connector is a dumb accessor over the REMOTE only — it exposes exactly what is pushed to the repo (tree, file contents, branches, PRs, issues, commits), nothing more. Do NOT assume or read any local working copy, uncommitted changes, or paths outside the configured repo. Tree/file reads reflect the default branch unless you explicitly inspect another branch; PRs/issues/commits are API-only (not in the git tree). Aim for ~20-30 focused chunks — one tree/file/list per chunk.

### Jira
- Boards and projects overview
- Epics (high-level feature groupings)
- Recent sprints (what's being worked on)
- Component list (if used)
- Labels/tags (reveal feature categorization)

### Figma
- Page list (each page often = one feature area)
- Top-level frames per page (reveal UI sections)
- Component sets (reveal reusable patterns)
- Prototype flows (reveal user journeys)
```

## Tools

The agent has access to these tools (per source type):

### GitHub Tools

| Tool | Description | Returns |
|---|---|---|
| `github_get_repo` | Get repository metadata | name, description, language, topics, default_branch |
| `github_list_tree` | List files/dirs at a path | array of {name, type, path} |
| `github_read_file` | Read a file's content | file content as string |
| `github_list_branches` | List all branches | array of branch names |
| `github_list_prs` | List pull requests (state: open/closed/all) | array of {title, body, state, files_changed} |
| `github_list_issues` | List issues | array of {title, body, labels, state} |
| `github_search_code` | Search code in repo | array of {path, matches} |

### Jira Tools

| Tool | Description | Returns |
|---|---|---|
| `jira_list_projects` | List accessible projects | array of {key, name} |
| `jira_list_epics` | List epics in a project | array of {key, summary, description, status} |
| `jira_list_sprint_issues` | List issues in current sprint | array of {key, summary, type, status} |
| `jira_get_issue` | Get issue details | {key, summary, description, acceptance_criteria, labels} |
| `jira_list_components` | List components | array of {name, description} |

### Figma Tools

| Tool | Description | Returns |
|---|---|---|
| `figma_list_pages` | List pages in a file | array of {name, id} |
| `figma_list_frames` | List top-level frames in a page | array of {name, bounds, children_count} |
| `figma_list_components` | List component sets | array of {name, variants} |
| `figma_get_prototype_flows` | List prototype flows | array of {name, start_node, connections} |

### Storage / File Drop Tools

| Tool | Description | Returns |
|---|---|---|
| `storage_list_files` | List files/dirs at a path (with depth limit) | array of {name, type, path, size} |
| `storage_read_file` | Read a text file's content | file content as string |
| `storage_read_pdf` | Extract text from a PDF file | extracted text as string |
| `storage_describe_image` | Describe an image file (via vision model) | description as string |
| `storage_get_metadata` | Get folder-level metadata | {total_files, total_size, file_types, last_modified} |

## Output Schema

The agent collects chunks by calling a `save_chunk` tool repeatedly as it explores:

```json
{
  "name": "save_chunk",
  "parameters": {
    "type": "object",
    "required": ["type", "content", "metadata"],
    "properties": {
      "type": { "type": "string", "enum": ["repo_metadata", "feature_tree", "navigation_structure", "coordinator", "view_model", "accessibility_map", "ui_structure", "config", "documentation", "api_routes", "route_config", "package_json", "file_tree"], "description": "Chunk type from the taxonomy" },
      "content": { "type": "string", "description": "Structural information extracted from the source. Can be JSON-stringified for structured data or plain text for descriptions." },
      "metadata": { "type": "object", "required": ["origin", "note"], "properties": { "origin": { "type": "string", "description": "Path to the source file or directory" }, "note": { "type": "string", "description": "One-line description of what this chunk contains" } } }
    }
  }
}
```

When the agent decides it has collected enough, it calls `finish_collection`:

```json
{
  "name": "finish_collection",
  "parameters": {
    "type": "object",
    "required": ["summary"],
    "properties": {
      "summary": {
        "type": "object",
        "required": ["total_chunks", "sources_explored", "areas_discovered"],
        "properties": {
          "total_chunks": { "type": "number" },
          "sources_explored": { "type": "array", "items": { "type": "string" } },
          "areas_discovered": { "type": "array", "items": { "type": "string" }, "description": "Brief list of areas the agent noticed (NOT features — just areas it saw). This is for logging, not for downstream processing." }
        }
      }
    }
  }
}
```

## Step Output Contract

After the agent finishes, the engine assembles the final step output:

```json
{
  "type": "object",
  "required": ["raw_chunks", "summary"],
  "properties": {
    "raw_chunks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "source", "type", "content", "metadata"],
        "properties": {
          "id": { "type": "string", "description": "Generated ID (e.g., gh-001, jira-001)" },
          "source": { "type": "string", "enum": ["github", "storage", "jira", "figma"], "description": "Source connector type" },
          "type": { "type": "string" },
          "content": { "type": "string" },
          "metadata": { "type": "object" }
        }
      }
    },
    "summary": {
      "type": "object",
      "properties": {
        "total_chunks": { "type": "number" },
        "by_source": { "type": "object", "additionalProperties": { "type": "number" } }
      }
    }
  }
}
```

## Evaluation Criteria

1. **Breadth** — Did the agent explore all connected sources? Did it cover structure, docs, navigation, configuration?
2. **Depth** — Did it go deep enough into high-value files (coordinators, view models, accessibility IDs)?
3. **Relevance** — Are the collected chunks useful for feature discovery? No test files, no CI configs, no raw source code dumps?
4. **Efficiency** — Did it hit the 25-35 chunk target? Over-collecting wastes tokens; under-collecting misses features.
5. **Structural extraction** — Chunks contain what the file exposes (screens, flows, UI elements, actions), not raw code or feature classifications.
6. **Accessibility coverage** — Was the test ID / accessibility identifier file found and collected? This is the single most valuable chunk.
7. **Chunk type consistency** — Does each chunk use the correct type from the taxonomy? Are types consistent across similar chunks?

## Real-World Reference (Oysho iOS App — 2926 Swift files, 54 features)

This reference comes from the first production execution of Step 1. Use it to calibrate expectations for large mobile app projects.

| Metric | Value |
|--------|-------|
| Total chunks produced | 30 |
| Chunk types used | repo_metadata (1), feature_tree (2), navigation_structure (2), coordinator (6), view_model (7), accessibility_map (1), ui_structure (5), config (2), documentation (1), view_model/checkout_resume (1) |
| Highest-value chunk | `accessibility_map` — 111 UI sections, 801 elements. Single source of truth for all test selectors. |
| Second highest value | `feature_tree` — all 54 feature modules with file counts. Gives Step 2 the complete surface to classify. |
| Third highest value | `coordinator` chunks (checkout, payment, click-and-collect) — reveal user flows and decision points. |
| Exploration depth | Read ~15 key files (coordinators, view models, config files) out of 2926 total Swift files (~0.5%) |
| Token budget consumed | ~80K tokens (Phase 1: 15K, Phase 2: 25K, Phase 3: 40K) |

## Engine Integration

### Source Materialization (pre-agent)

Before the CollectorAgent starts, the engine **materializes** each connected source to a local directory. This is a deterministic, non-LLM step — the engine downloads everything so the agent can explore locally via filesystem tools. This is analogous to `git clone` before running any analysis.

| Connector | Materialization strategy | Local path |
|-----------|------------------------|------------|
| **GitHub** | `git clone --depth=1 {repo_url}` using connector credentials (PAT/deploy key). Clones the default branch. If specific branches are selected, clones those instead. | `/tmp/engine/{job_id}/github/{repo_name}/` |
| **Supabase Storage** | Download the zip archive from the bucket via Storage REST API using the connector's `serviceRoleKey`. Extract to local dir. If no zip exists, download all files via parallel batch requests (20 concurrent, skip binary mimetypes). | `/tmp/engine/{job_id}/storage/{bucket_name}/` |
| **Jira** | Fetch all epics, sprint issues, and components via Jira REST API using connector credentials. Serialize each entity as a JSON file (one per epic, one per sprint, one index). | `/tmp/engine/{job_id}/jira/{project_key}/` |
| **Figma** | Fetch file metadata, page list, frame hierarchy, component sets, and prototype flows via Figma REST API. Serialize as JSON (one file per page, one index). Optionally export key frame thumbnails as PNG. | `/tmp/engine/{job_id}/figma/{file_key}/` |

**Credentials**: The engine reads `credentials` from the `connector_configs` table for the tenant's configured connector. Each connector stores its own credential shape:
- GitHub: `{ pat: string }` or `{ appId, installationId, privateKey }`
- Supabase Storage: `{ projectUrl: string, serviceRoleKey: string }`
- Jira: `{ baseUrl: string, email: string, apiToken: string }`
- Figma: `{ personalAccessToken: string }`

**Materialization is mandatory** — the agent NEVER calls external APIs directly. All tools (`storage_list_files`, `storage_read_file`, etc.) operate on the local materialized directory. This ensures:
1. **Reproducibility** — re-running the agent on the same materialized snapshot produces the same chunks
2. **Speed** — filesystem reads are orders of magnitude faster than API calls per file
3. **Isolation** — the agent cannot accidentally mutate the source (read-only local copy)
4. **Offline capability** — once materialized, the pipeline can run without network access

**Cleanup**: The engine deletes `/tmp/engine/{job_id}/` after the job completes or fails.

### Agent Execution

- **Invocation**: Single autonomous agent with tool access. One CollectorAgent per engine job.
- **Input**: `sources[]` from the engine job config — each source specifies a connector type (`github`, `jira`, `figma`, `storage`), credentials, and selected items (repo URL, project key, file ID, folder path). The agent also receives `materialized_paths` — a map of `{connector_type}/{item_name} → local_path` so it knows where to find the files.
- **Tool binding**: The engine maps abstract tool names (e.g., `github_list_tree`, `storage_list_files`) to **local filesystem operations** on the materialized directory. The agent calls `storage_list_files("code/ios/")` and the engine translates it to `ls /tmp/engine/{job_id}/storage/{bucket}/code/ios/`. The agent is unaware of the underlying implementation.
- **Model tier**: Agent-capable model (must support tool use and autonomous multi-step reasoning).
- **Token budget**: Variable — the agent self-regulates via "stop collecting" heuristics. Expect 20-40 tool calls and ~50K-100K total tokens depending on project size and number of connected sources.
- **Parallelism**: None — single agent explores all connected sources sequentially within one invocation.
- **Error handling**: Tool call failures (file not found, read error) are recorded in chunk metadata by the agent. The engine retries the full step on unrecoverable agent errors (max 2 retries).
- **Post-processing**: The engine assigns sequential IDs to chunks (`gh-001`, `jira-001`, `st-001`), sets `source` from the connector type, and assembles the final output.

### Step Transition (engine worker responsibility)

When the engine worker completes a step, it is responsible for wiring the next step's input before transitioning it. This is NOT the agent's job — the agent only produces output. The engine worker handles the state machine.

**On step completion, the engine worker MUST (in order):**

1. Write the step's `output` JSONB and set `status = 'completed'`, `completed_at = now()`
2. Read the next step in the pipeline (by `position + 1`)
3. Set the next step's `input` = current step's `output` (the full JSONB, not a reference)
4. Set the next step's `status = 'running'`, `started_at = now()`
5. Update the parent `engine_jobs.updated_at`

**This applies to every step transition in the pipeline** — not just Step 1 → Step 2. Each step's output becomes the next step's input. The contract is:

```
step[N].output  →  step[N+1].input  (verbatim copy, full JSONB)
```

If the worker crashes between step 4 and 5, the next step will have `status = 'running'` but no `input` — the worker must check for this on recovery and re-wire from the previous step's output.
