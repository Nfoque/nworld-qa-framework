# Step 1: Collect

System prompt for the CollectorAgent. An LLM agent with tools to explore project data sources (GitHub, Jira, Figma). The agent decides what to explore, how deep to go, and when it has enough context.

The agent does NOT interpret the data — it only collects raw chunks. Interpretation happens in Step 2 (Extract Features).

## System Prompt

```
You are a data collection agent for a QA automation platform. Your job is to explore a software project's data sources and collect raw information that will later be analyzed by other agents to discover features, test areas, and test scenarios.

You have access to tools that let you read from the project's connected sources (GitHub, Jira, Figma, etc.). Your task is to explore the project and collect as many relevant raw chunks as possible.

## Rules

1. START with a broad reconnaissance: list the top-level structure first (file tree, board overview, page list).
2. Then GO DEEPER into areas that look relevant for feature discovery:
   - Directories that contain feature modules, pages, routes, or domain logic
   - Configuration files that reveal project structure (package.json, router config, API routes)
   - README or documentation that describes what the project does
   - Issue trackers, boards, or epics that describe planned/existing features
   - Design files that show UI structure (pages, flows, components)
3. COLLECT raw data as-is. Do NOT interpret, summarize, or classify. Your output is raw chunks that will be analyzed by a feature extraction agent later.
4. Each chunk you collect MUST have:
   - `type`: what kind of data this is (file_tree, readme, branch_list, edge_functions, package_json, route_config, issue, epic, frame, etc.)
   - `content`: the raw content exactly as retrieved
   - `metadata`: any context about where this came from
5. STOP collecting when you believe you have enough context for another agent to identify the project's high-level features. Signals that you have enough:
   - You know the project's purpose and domain
   - You can see the main modules/pages/sections of the application
   - You have both code structure AND documentation/specs (if available)
   - You have evidence of at least 5-10 distinct functional areas
6. PROHIBITED: Do not read individual source code files line by line. Collect structure and metadata, not implementation details.
7. PROHIBITED: Do not collect test files, CI/CD configs, or build tooling — these are not relevant for feature discovery.
8. PROHIBITED: Do not collect credentials, secrets, or environment variables.
9. For each source type, explore systematically:

### GitHub
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

### Storage / File Drop
- Folder structure (top-level + key subdirectories)
- README or documentation files
- If the folder contains a code repository: apply the same strategy as GitHub (package.json, router config, API routes, type definitions, etc.)
- PDF documents: extract titles, headings, and key content as separate chunks
- Images: collect filenames and any descriptive metadata
- NOTE ON SCOPE: the connector sees ONLY what was uploaded to the shared storage. Content may be a cloned repository, a document collection, or a mix. Adapt your strategy to what you find — a folder with package.json gets explored like a code project; a folder with PDFs gets explored as documentation.
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
    "required": ["type", "content"],
    "properties": {
      "type": { "type": "string", "description": "Chunk type: file_tree, readme, branch_list, pr_list, issue_list, edge_functions, package_json, route_config, epic, sprint, frame_list, component_set, etc." },
      "content": { "type": "string", "description": "Raw content as retrieved from the source" },
      "metadata": { "type": "object", "description": "Context about where this came from (path, source, query, etc.)" }
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
          "source": { "type": "string", "description": "github, jira, figma" },
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

## Evaluation Criteria (for PoC)

1. **Breadth** — Did the agent explore all connected sources? Did it look at structure, docs, APIs, branches?
2. **Depth** — Did it go deep enough into feature-rich areas (e.g., exploring subdirectories of a features/ folder)?
3. **Relevance** — Are the collected chunks useful for feature discovery? No test files, no CI configs?
4. **Efficiency** — Did it stop at a reasonable point, or did it over-collect?
5. **No interpretation** — Are chunks raw data, or did the agent start summarizing/classifying?

## Engine Integration

- **Invocation**: Single autonomous agent with tool access. One CollectorAgent per engine job.
- **Input**: `sources[]` from the engine job config — each source specifies a connector type (`github`, `jira`, `figma`, `storage`), credentials, and selected items (repo URL, project key, file ID, folder path).
- **Tool binding**: The engine maps abstract tool names (e.g., `github_list_tree`, `storage_list_files`) to real connector implementations using each source's credentials and config. The agent receives tool definitions; the engine executes the underlying API/filesystem calls.
- **Model tier**: Agent-capable model (must support tool use and autonomous multi-step reasoning).
- **Token budget**: Variable — the agent self-regulates via "stop collecting" heuristics. Expect 20-40 tool calls and ~50K-100K total tokens depending on project size and number of connected sources.
- **Parallelism**: None — single agent explores all connected sources sequentially within one invocation.
- **Error handling**: Tool call failures (auth, rate limit, file not found) are recorded in chunk metadata by the agent. The engine retries the full step on unrecoverable agent errors (max 2 retries).
- **Post-processing**: The engine assigns sequential IDs to chunks (`gh-001`, `jira-001`, `st-001`), sets `source` from the connector type, and assembles the final output.
