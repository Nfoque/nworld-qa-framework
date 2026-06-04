# QAAP — Connector Specification

## Overview

Connectors are the extensible integration layer that allows QAAP to pull context from external systems and push results back. Every connector follows a uniform interface — adding a new connector requires one file + registration.

---

## Connector Interface

```typescript
interface Connector<TConfig, TCredentials> {
  id: string;                                   // "jira", "github", "s3", "gdrive"
  name: string;                                 // Human-readable: "Jira Cloud"
  category: ConnectorCategory;
  icon: string;                                 // Icon identifier for frontend

  configSchema: ZodSchema<TConfig>;             // Zod schema → auto-generates UI form
  credentialSchema: ZodSchema<TCredentials>;     // Zod schema for credentials

  // Lifecycle
  testConnection(creds: TCredentials): Promise<ConnectionTestResult>;
  sync(config: TConfig, creds: TCredentials): Promise<SyncResult>;

  // Category-specific methods (type-narrowed by category)
}

type ConnectorCategory =
  | "task-manager"      // Jira, Linear, Trello
  | "document-source"   // S3, GDrive, Azure Blob, OneDrive
  | "code-repo"         // GitHub, GitLab, Bitbucket
  | "test-runner";      // XRay, TestRail (output destinations)
```

### Category-Specific Methods

```typescript
// task-manager
interface TaskManagerConnector extends Connector {
  fetchTickets(query: TicketQuery): Promise<Ticket[]>;
  fetchTicketDetail(key: string): Promise<TicketDetail>;     // ACs, description, links
  pushTestResults(results: TestResultPayload): Promise<void>; // Push to XRay, etc.

  // Write-back operations (audit trail — Nesvitii pattern)
  postComment(key: string, message: string): Promise<void>;           // Progress notifications
  transitionStatus(key: string, to: string): Promise<void>;           // Move ticket through workflow
  linkPR(key: string, prUrl: string): Promise<void>;                  // Attach PR reference to ticket
}

// document-source
interface DocumentSourceConnector extends Connector {
  listDocuments(path?: string): Promise<DocumentRef[]>;
  fetchDocument(ref: DocumentRef): Promise<DocumentContent>;  // Returns text/chunks
}

// code-repo
interface CodeRepoConnector extends Connector {
  fetchFiles(query: FileQuery): Promise<FileContent[]>;       // Get source code
  createPR(pr: PRPayload): Promise<PRResult>;                 // Push generated tests
  pushFiles(files: FilePayload[]): Promise<void>;
  registerWebhook(config: WebhookConfig): Promise<void>;      // For source change detection
}

// test-runner (output)
interface TestRunnerConnector extends Connector {
  pushExecution(execution: ExecutionPayload): Promise<void>;
  fetchResults(query: ResultQuery): Promise<ExternalResult[]>;
}
```

### Standard Response Types

```typescript
interface ConnectionTestResult {
  success: boolean;
  message: string;                // "Connected to Jira Cloud (project ACME)"
  details?: Record<string, any>; // Extra info (project list, repo count, etc.)
}

interface SyncResult {
  itemsSynced: number;
  errors: SyncError[];
  lastSyncedAt: Date;
}
```

---

## Provider Catalog

### Phase 1 (manual input, no API)

| Connector | Category | Notes |
|-----------|----------|-------|
| **Free Text** | (inline) | Paste requirements directly — no external system |
| **OpenAPI URL** | (inline) | Fetch and parse OpenAPI spec from URL |
| **Jira Key** | (inline) | Manual ticket key entry for tagging — no Jira API |

### Phase 2

| Connector | Category | Config | Credentials |
|-----------|----------|--------|-------------|
| **Jira Cloud** | task-manager | `{ baseUrl, projectKey, jqlFilter? }` | `{ email, apiToken }` |
| **GitHub** | code-repo | `{ owner, repo, defaultBranch, pathFilters? }` | `{ token }` (PAT or GitHub App) |
| **S3** | document-source | `{ bucket, prefix?, region }` | `{ accessKeyId, secretAccessKey }` |

### Phase 3

| Connector | Category | Config | Credentials |
|-----------|----------|--------|-------------|
| **GitLab** | code-repo | `{ baseUrl, projectId, defaultBranch }` | `{ token }` |
| **Bitbucket** | code-repo | `{ workspace, repoSlug }` | `{ username, appPassword }` |
| **Google Drive** | document-source | `{ folderId, mimeTypes? }` | OAuth2 service account |
| **Azure Blob** | document-source | `{ accountName, containerName }` | `{ connectionString }` |
| **OneDrive** | document-source | `{ driveId, folderId }` | OAuth2 |
| **Linear** | task-manager | `{ teamId }` | `{ apiKey }` |
| **Trello** | task-manager | `{ boardId }` | `{ apiKey, token }` |
| **Jira XRay** | test-runner | `{ baseUrl, projectKey }` | `{ clientId, clientSecret }` |
| **TestRail** | test-runner | `{ baseUrl, projectId }` | `{ email, apiKey }` |

### Phase 4+

| Connector | Category | Notes |
|-----------|----------|-------|
| **Confluence** | document-source | Pull wiki pages as requirement docs |
| **Notion** | document-source | Pull pages/databases |
| **Slack** | (notification) | Post reports/alerts to channels |
| **Teams** | (notification) | Post reports/alerts to channels |
| **PagerDuty** | (notification) | Trigger incidents on critical failures |
| **OpsGenie** | (notification) | Alert routing |

---

## Credential Security

- All credentials encrypted at rest with **AES-256-GCM**
- Encryption key: per-deployment env var (`QAAP_CREDENTIAL_KEY`)
- On-prem: client controls the key
- Never logged, never included in prompt logs or error messages
- Credentials validated on save via `testConnection()`
- UI: credential fields are masked with reveal toggle, never sent back to frontend after save

### Write-Back Sequence (Task Manager)

When QAAP generates tests from a Jira ticket, the full write-back sequence provides
an audit trail from ticket to CI result (pattern from Nesvitii):

```
1. fetchTicketDetail(key)          → read AC, description, links
2. postComment(key, "Starting...")  → notify stakeholders
3. transitionStatus(key, "In Progress")
4. [pipeline runs: parse → generate → codify]
5. postComment(key, "PR created: <url>")
6. linkPR(key, prUrl)
7. transitionStatus(key, "In Review")
8. [if tests fail in CI]
   postComment(key, "Tests failed: <summary>")
   transitionStatus(key, "In Progress")
```

Write-back operations are optional — the connector works read-only if the tenant
doesn't grant write permissions. Each write-back step is idempotent and failure-tolerant
(a failed comment post doesn't block the pipeline).

---

## Sync Flow

```
User configures connector for a test plan
  │
  ▼
testConnection() ─── validates credentials + connectivity
  │
  ▼
ConnectorConfig saved to DB (credentials encrypted)
  │
  ▼
sync() called ─── either:
  ├── On-demand: user clicks "Sync Now"
  ├── On plan generation: pipeline triggers sync before parsing
  └── Periodic: BullMQ job (configurable per connector)
  │
  ▼
Sync results stored as ContextSource records
  │  - extracted_data: structured output (testIds, ACs, endpoints, etc.)
  │  - sync_status: synced / error
  │  - last_synced_at
  │
  ▼
Pipeline parsers consume ContextSource.extracted_data during generation
```

---

## Adding a New Connector

1. Create `apps/api/src/modules/connector/providers/<name>.ts`
2. Implement the `Connector` interface (or category-specific sub-interface)
3. Define `configSchema` and `credentialSchema` with Zod
4. Register in `apps/api/src/modules/connector/registry.ts`
5. Frontend auto-generates the configuration form from the Zod schemas (no connector-specific UI code needed)

```typescript
// Example: apps/api/src/modules/connector/providers/linear.ts
export const linearConnector: TaskManagerConnector<LinearConfig, LinearCredentials> = {
  id: "linear",
  name: "Linear",
  category: "task-manager",
  icon: "linear",

  configSchema: z.object({
    teamId: z.string().describe("Linear team ID"),
  }),

  credentialSchema: z.object({
    apiKey: z.string().describe("Linear API key"),
  }),

  async testConnection(creds) {
    // Call Linear API to verify
  },

  async sync(config, creds) {
    // Pull issues from Linear team
  },

  async fetchTickets(query) {
    // Linear-specific issue fetching
  },

  async fetchTicketDetail(key) {
    // Pull single issue with description, labels, etc.
  },

  async pushTestResults(results) {
    // Optional: push test results as comments or linked items
  },
};
```
