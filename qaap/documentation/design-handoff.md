# QAAP — Design Handoff

This document is a standalone design brief for creating UI mockups and visual designs. It is portable — take it to any design tool or AI design assistant and return the decided designs back to the project.

---

## Product Identity

**QAAP** — QA Automation Platform by NFQ. Enterprise SaaS for QA experts to automate E2E test plan creation and maintenance using AI. The platform replaces traditional QA departments with a combination of QA expertise + AI-powered automation.

**Target users**: QA Engineers, QA Leads, QA Managers at enterprise companies (Inditex scale). Technical but not developers — they think in test plans, acceptance criteria, and regression suites, not in code.

**Tone**: Professional, precise, trustworthy. This is a tool that handles critical quality assurance — it should feel serious and reliable, not playful. Think "enterprise tool that doesn't look boring" — clean, modern, data-dense but not cluttered.

**UI Framework**: MUI (Material UI) v6 for React 19. ThemeProvider for per-tenant branding.

**Branding system**: Each client tenant has their own branding (logo, primary color, accent color, font). The platform shell adapts to tenant branding via MUI ThemeProvider. NFQ's default brand should be the base design.

---

## Screen Inventory

### 1. Login Page
- Tenant-branded: tenant logo, custom login message, tenant colors
- SSO button ("Sign in with [Company SSO]") + fallback email/password
- Clean, centered card layout
- Tenant slug resolved from subdomain: `acme.qaap.dev`

### 2. Dashboard
- Welcome + summary stats: total plans, active executions, recent activity
- Quick actions: "New Test Plan", "View Recent Executions"
- Activity feed: recent plan generations, executions, reviews
- Cards or widgets layout

### 3. Test Plans List
- Table/DataGrid view with columns: Name, Modality (web|api|ios with icon/badge), Status (draft|generating|review|approved|archived), Scenarios count, Last updated, Assigned to
- Filter bar: by modality, status, assigned user
- Search
- "New Test Plan" primary action button
- Status badges with color coding

### 4. New Test Plan Wizard (multi-step)
- **Step 1: Basics** — Name, description, modality selector (Web/API/iOS cards with icons), target framework (Playwright/Cypress for web, Karate for API)
- **Step 2: Context Sources** — "Add sources" panel (NotebookLM-inspired). Source types as cards: "Jira Tickets", "Code Repository", "OpenAPI Spec", "Documents", "Free Text". Each opens a config form. Added sources shown as removable chips/cards. This is the KEY differentiator screen — make it feel powerful but simple
- **Step 3: LLM Config** — Select primary model, optionally select review model for "second opinion". Show model cards with provider logo + model name. Toggle for "Enable second opinion review"
- **Step 4: Environment** — Configure target environments (pro, pre, dev) with URLs. Simple key-value table
- **Step 5: Review & Generate** — Summary of all config. Big "Generate Test Plan" action button

### 5. Test Plan Detail (the main workspace — MOST IMPORTANT SCREEN)

Split-panel layout, think IDE-like:

```
┌──────────────────────────────────────────────────────────────────┐
│ Header: Plan name, modality badge, status, actions (Run, Export)│
├──────────────┬──────────────────────────┬───────────────────────┤
│              │                          │                       │
│  Scenario    │   Main Editor            │   Chat Panel          │
│  Sidebar     │                          │   (collapsible)       │
│              │   Tab 1: Gherkin         │                       │
│  - Scenario1 │   Tab 2: Generated Code  │   "Add negative case  │
│  - Scenario2 │   Tab 3: Execution       │    for expired card"  │
│  - Scenario3 │                          │                       │
│  ● approved  │   [Gherkin editor with   │   AI: "I've added     │
│  ● pending   │    syntax highlighting]  │    Scenario 7..."     │
│  ○ rejected  │                          │                       │
│              │                          │   [Input box]         │
│  [Add new]   │                          │                       │
│              │                          │                       │
├──────────────┴──────────────────────────┴───────────────────────┤
│ Footer: Confidence summary bar (% green/yellow/red) | Stats    │
└──────────────────────────────────────────────────────────────────┘
```

Key elements:
- **Scenario sidebar**: List of all test scenarios. Each shows: title, confidence badge (green/yellow/red circle), review status icon (checkmark/clock/X). Drag to reorder. Filterable.
- **Gherkin tab**: Rich text editor (Tiptap) with Gherkin syntax highlighting (Feature, Scenario, Given/When/Then keywords colored). Inline confidence indicators per scenario. "Approve" / "Reject" / "Edit" actions per scenario.
- **Code tab**: Monaco editor showing generated Playwright/Cypress/Karate code. Read-only with "Regenerate" option. Side-by-side with Gherkin if viewport allows.
- **Execution tab**: Run history, results timeline, pass/fail badges, failure details.
- **Chat panel**: Collapsible right panel. Chat with AI about the plan. Messages show applied changes ("I modified Scenario 3"). Context-aware — AI knows the plan, sources, and current state.
- **Confidence bar** in footer: visual bar showing distribution of scenario confidence scores. Clicking a segment filters the sidebar.
- **Provenance indicators**: "Generated by Claude Sonnet 4" / "Reviewed by Gemini 2.5 Pro" as subtle tags.

### 6. Context Sources Panel (within plan detail)
- Grid/list of connected sources with type icon, status (synced/syncing/error), last sync time
- Each source expandable to show what was extracted
- "Add Source" opens the same source selector from the wizard
- "Sync Now" action per source

### 7. Connectors Settings (tenant-level)
- Card grid of available connector types (Jira, GitHub, S3, GDrive, Linear, Trello...)
- Each card shows: connector icon/logo, name, status (configured/not configured), "Configure" button
- Config form is dynamically generated from Zod schema
- "Test Connection" button with success/failure feedback
- Credential fields are masked with reveal toggle

### 8. Execution View
- Timeline/history of all executions
- Each execution: status badge, environment, trigger type (manual/cron/webhook), duration, pass rate bar
- Drill-down into execution: tree view of scenarios → individual results
- Failed tests show: error message, screenshot (if web), failure classification badge (one of 7 categories), AI-generated root cause analysis with confidence
- Actions: "Rerun", "Export Report", "Create Bug" (push to Jira)

### 9. LLM Settings (tenant-level)
- Provider configuration cards: Add providers (Anthropic, OpenAI, Google, Ollama/Local)
- Each provider: base URL, API key (masked), available models list
- **Task-to-Model Matrix**: Table/visual mapping showing which model handles which task (generation, review, codification, classification, failure analysis). Drag-and-drop or dropdown to reassign.
- Token usage dashboard: cost tracking per provider per period

### 10. Branding Settings (tenant-level)
- Live preview of the platform with tenant's branding
- Upload logo, favicon
- Color pickers for primary, accent, background
- Font family selector
- Custom login page message
- "Preview" button to see changes before saving

### 11. Health Dashboard (test progression and statistics landing)
- **Top-level health cards**: One per test plan showing health_status (healthy/degrading/critical) with trend sparkline
- **Pass rate over time chart**: Line chart across executions, filterable by plan/environment/branch
- **Flaky test tracker**: Tests that flip pass/fail, ranked by flakiness score
- **Coverage gap heatmap**: Visual map of what areas have tests vs what doesn't
- **Execution time trends**: Detect regressions in test suite speed
- **Branch comparison**: Side-by-side pass rates across branches (main vs feature/*)
- **Environment comparison**: Same tests across pro/pre/dev — spot env-specific failures
- **Alerts panel**: Configurable thresholds ("alert if pass rate drops below 90%"), notification history
- **Degradation detection**: AI flags when a suite is trending toward failure before it actually breaks

### 12. AI Fix Proposals (proactive improvements)
- Card list of AI-generated proposals, each showing:
  - Type badge: bug_detection | fix_proposal | test_improvement | coverage_gap
  - Description + rationale + confidence score
  - Affected files (linked to repo)
  - Suggested diff (Monaco viewer with inline diff)
  - Status: proposed → accepted/rejected → PR created
- Actions per proposal: "Accept" → opens PR creation flow, "Reject" with reason, "Discuss" → opens chat
- Source indicator: "Detected from Execution #47" or "Detected from trend analysis" or "Detected from source change in commit abc123"
- This is a KEY differentiator — the system doesn't just find problems, it proposes fixes

### 13. Reports & Delivery
- List of generated reports with filters (plan, execution, format, date)
- Report viewer: HTML report embedded, PDF downloadable
- "Generate Report" wizard: select execution(s), format (HTML/PDF/JUnit XML/XRay), delivery (download/email/Slack/Teams/Jira/webhook)
- **Delivery configuration**: Set up recurring report delivery (e.g., "send HTML report after every nightly regression to qa-team@client.com and #qa-channel in Slack")
- **Email template**: Branded with tenant colors, summary stats, link to full report
- **Push notifications**: Mobile/desktop push for critical failures (integrable with PagerDuty, OpsGenie)

### 14. Cron/Scheduled Runs
- Table of scheduled runs: plan name, cron expression (human-readable), environment, branch filter, enabled toggle, last/next run
- "New Schedule" form: select plan, environment, branch pattern, cron builder (visual, not raw cron expression), auto-report config, notification recipients
- **Branch-based regressions**: Run nightly on `main`, on every push to `develop`, on PR creation for `feature/*`
- Execution history linked per schedule with trend charts
- Quick stats: "Last 7 days: 14/14 passed", "Last failure: 3 days ago"

---

## Component Patterns

- **Confidence badges**: Small colored circles or pills — green (>=85%), amber (60-84%), red (<60%). Used everywhere: scenario list, plan list, generated code.
- **Status badges**: Draft (gray), Generating (blue pulse/animation), Review (amber), Approved (green), Archived (muted).
- **Modality icons**: Web (browser icon), API (code/endpoint icon), iOS (phone icon). Used as badges alongside plan names.
- **Provider logos**: Small logos for Anthropic, OpenAI, Google, Ollama next to model names.
- **Source type icons**: Distinct icons for Jira, GitHub, S3, GDrive, free text, OpenAPI.
- **Chat messages**: User messages right-aligned, AI messages left-aligned with model indicator. Applied changes highlighted/linked.

---

## Navigation Structure

```
Sidebar (persistent):
  ├── Dashboard
  ├── Test Plans
  ├── Health                ← Trends, stats, alerts, degradation detection
  ├── AI Proposals          ← Proactive fix proposals, coverage gaps
  ├── Executions
  ├── Schedules             ← Cron/branch-based regression config
  ├── Reports
  ├── Connectors
  └── Settings
       ├── LLM Providers
       ├── Branding
       ├── SSO
       ├── Notifications    ← Email, Slack, Teams, webhook, push delivery config
       └── Team

Top bar:
  ├── Tenant logo (left)
  ├── Breadcrumb (center)
  ├── Notification bell with unread count (right)
  └── User avatar + menu (right)
```

---

## Key User Flows to Design

1. **First-time setup**: Login → configure first connector (Jira) → configure LLM provider → create first plan
2. **Plan creation**: New Plan wizard → sources added → generate → review in editor → approve → codify → download
3. **Iterative review**: Open plan → see yellow/red scenarios → chat "explain why scenario 4 has low confidence" → AI explains → user edits → re-approve
4. **Second opinion**: Generate with Claude → toggle "Review with Gemini" → see diff/suggestions → accept/reject per suggestion
5. **Execution cycle**: Run plan → watch real-time progress (SSE) → review failures → AI explains failure → "Create Bug in Jira"
6. **Health monitoring**: Check Health Dashboard → see degrading plan → drill into flaky tests → review AI fix proposals → accept proposal → PR created

---

## Design References / Inspiration

- **NotebookLM** (Google): For the "add diverse sources and chat about them" UX pattern
- **Linear**: For the clean, fast, keyboard-navigable enterprise UX
- **Cursor/Windsurf IDE**: For the split-panel layout with AI chat sidebar
- **Vercel Dashboard**: For the execution/deployment timeline UX
- **Playwright Trace Viewer**: For the test execution detail UX
- **Datadog/Grafana**: For the health dashboard, sparklines, and alerting UI
