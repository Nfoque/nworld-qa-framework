---
title: "MCP + Playwright + Jira: How I Automated My Entire QA Workflow End-to-End"
author: Mykola Nesvitii
date: 2026-04-23
url: https://medium.com/@nesvitii/mcp-playwright-jira-how-i-automated-my-entire-qa-workflow-end-to-end
status: ✅ distilled
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

Full pipeline with no human intervention: Jira ticket → Claude API (orchestrator) → generates Playwright spec → runs tests → creates PR → updates Jira. Uses Claude API directly (not Cursor/Cline) with 3 MCP servers (Jira, Playwright, GitHub). The key is not generating the test, it's automating the **80% of scaffolding** around the test.

## Architecture

```
Jira ticket (acceptance criteria)
  │
  ▼
Claude API (orchestrator)
  ├── Jira MCP ──────── read ticket, post comments, transition status
  ├── Playwright MCP ── inspect DOM, run tests, capture traces
  └── GitHub MCP ────── create branch, commit, open PR
  │
  ▼
Playwright spec committed to repo
Jira ticket moved to "In Review"
PR linked in ticket comment
```

Trigger: Jira automation rule — when a ticket receives the label `needs-e2e` and moves to "In Progress", it is assigned to the bot and fires a webhook.

## Why direct Claude API (not IDE agents)

- Cursor/Cline are optimized for interactive human-in-the-loop sessions
- The workflow needs to run **headlessly**: triggered by webhook, unsupervised, deterministic output
- Full control over: system prompt, tool definitions, retry logic, output format
- Embeds into existing CI, doesn't depend on anyone's laptop

## The real problem: project conventions

Generating a Playwright test is trivial. Making the test respect the project's conventions (page object model, fixtures, naming, assertion style) is the **real engineering problem**.

### Attempt 1: Describe conventions in system prompt
Compliance ~70%. The other 30% the agent ignored the rules or hallucinated its own patterns.

### Attempt 2: Attach 2-3 example files as few-shot
Compliance ~85%. But it kept inventing selectors that didn't exist in the DOM and creating its own helpers instead of using existing ones.

### Attempt 3 (production): AGENTS.md + DOM inspection via Playwright MCP

Two changes that solved it:

**1. Strict AGENTS.md, not descriptive.** Not "prefer data-testid selectors" but:
```markdown
## SELECTORS
- ONLY use data-testid attributes: page.getByTestId('submit-btn')
- CSS class selectors: PROHIBITED
- XPath: PROHIBITED
- Text-based selectors: allowed only as fallback for third-party components

## PAGE OBJECTS
- All page interactions must go through a Page Object in /pages/
- Never call page.click() directly in a spec file
- Page Object constructor signature: constructor(readonly page: Page) {}

## FIXTURES
- Extend the base fixture in /fixtures/base.ts
- Never use test.beforeEach() for auth — use the authed fixture
- Data setup goes in /fixtures/data-factory.ts
```

> *Don't chase the agent's mistakes with prompt tweaks. Make the contract (AGENTS.md) more precise. The agent will follow a clear, unambiguous rule far more reliably than a nuanced description.*

**2. Playwright MCP inspects the DOM before writing code.** The agent navigates to the page under test, extracts the real `data-testid` attributes that exist. It writes selectors from evidence, not from memory.

## Jira integration in detail

Full sequence of operations per ticket:

1. **Fetch ticket fields** — summary, description, acceptance criteria, linked tickets, labels, story points
2. **Post comment** — "Starting automated test generation. Will update when PR is ready."
3. **Transition status** — "To Do" → "In Progress"
4. **After PR created** — post PR link as comment
5. **Transition status** — "In Progress" → "In Review"
6. **If tests fail in CI** — post failure summary, transition back to "In Progress"

The ticket ends up with a complete audit trail: from ticket to CI result.

## Acceptance criteria extraction: normalisation step

Jira tickets are freeform (Gherkin, bullets, prose). A **dedicated Claude API call prior to** the main agent normalizes the ticket to structured JSON:

```typescript
const normalize = await claude.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  system: 'You extract testable assertions from Jira tickets.
           Return ONLY valid JSON. No preamble. No markdown.',
  messages: [{
    role: 'user',
    content: `Ticket description:\n${ticket.description}\n\n
              Return JSON: { assertions: string[], preconditions: string[],
              userRole: string, feature: string }`
  }]
});

const { assertions, preconditions, userRole, feature } =
    JSON.parse(normalize.content[0].text);
```

The main agent receives clean and unambiguous requirements.

## Playwright MCP: two roles

### Role 1: DOM inspection before writing
Opens the feature under test locally or in staging, navigates to the relevant page, extracts all `data-testid` attributes from the UI region. Result: **ground-truth selector map** — it doesn't guess what elements exist.

### Role 2: Debug on failure
When a generated test fails, instead of hallucinating a fix from the error message:
1. Navigates to the page with headed browser
2. Executes steps up to the failure point
3. Takes screenshot and inspects DOM state
4. Compares expected selector vs what actually exists

```typescript
let attempts = 0;
while (attempts < 3) {
    const result = await runPlaywrightTest(specPath);
    if (result.passed) break;

    // Agent inspects the failure before fixing
    await agent.call('playwright_navigate', { url: result.failingUrl });
    await agent.call('playwright_screenshot', {});
    await agent.call('playwright_get_dom', { selector: result.failingSelector });

    const fix = await claude.messages.create({
      messages: [{ role: 'user', content:
        `Test failed at: ${result.error}\n
         Current DOM state: ${domSnapshot}\n
         Screenshot attached.\n
         Fix the spec. Follow AGENTS.md conventions.` }]
    });

    applyFix(fix);
    attempts++;
}
```

> Fix based on **observation, not inference** — almost always correct on the first attempt.

## Production results

| Metric | Before | After |
|--------|--------|-------|
| Time per feature ticket | ~3.5h (read ticket, design test, write, debug, update Jira, PR) | ~15min human review |
| Agent runtime | — | 8-12 min |
| Human QA work | Everything | Review PR + approve/request changes |

## What does NOT work well (yet)

- **Multi-actor flows** — tests that require two users interacting simultaneously (admin approves, user sees update in real-time). Fixture setup for multi-session state usually fails on the first attempt.
- **Ambiguous acceptance criteria** — "verify the dashboard loads correctly" → weak test that only checks page title. Garbage in, garbage out.
- **Visual regression** — pixel-level/layout comparison is out of scope. The agent has no concept of "this looks wrong".
- **Third-party components without data-testid** — fallback selector logic is fragile and usually fails.

## Recommended steps to replicate

1. **AGENTS.md first** — write conventions before a single line of agent code. It's the most valuable artifact.
2. **Jira MCP read-only** — have it read a ticket and print normalized JSON. Validate extraction quality.
3. **Playwright MCP for DOM inspection only** — without writing tests yet. Verify it extracts selectors from staging.
4. **First test with human-in-the-loop** — review output, update AGENTS.md with what fails.
5. **Jira write-back** — automate once test quality is good.
6. **Debug loop last** — only when there is confidence in the baseline.

Total build time: ~3 weeks part-time. AGENTS.md updated ~40 times since then.

## Reusable patterns / techniques

1. **Strict AGENTS.md > descriptive.** Explicit prohibitive rules ("PROHIBITED", "NEVER", "ONLY") work much better than descriptive guidelines ("prefer", "try to"). The agent follows clear rules with >95% compliance vs ~70% with descriptions.
2. **Pre-agent normalisation step.** Dedicated Claude call to convert freeform input (tickets) to structured JSON before passing it to the main agent. Separates parsing from reasoning.
3. **DOM inspection before code generation.** Playwright MCP extracts real selectors from the live DOM → ground-truth selector map. Eliminates selector hallucination.
4. **Observation-based debug loop.** When a test fails: screenshot + DOM snapshot + error → evidence-informed fix, not inference from the error message.
5. **Jira as automatic audit trail.** Every agent step is reflected in ticket comments and transitions → complete traceability with no manual effort.
6. **Headless Claude API > IDE agents for CI pipelines.** When the workflow is webhook-triggered and unsupervised, the direct API gives full control over prompt, tools, retry, and format.

## What we distilled to `research/`

→ Candidates for `insights.md`:
- **Strict AGENTS.md as convention contract** — pattern for any agent that generates code that must comply with project conventions.
- **Normalisation step for freeform inputs** — replicable pattern for any unstructured requirements source.
- **DOM-grounded code generation** — inspect real state before generating code that interacts with UI.
- **Observation-based debug** — screenshot + DOM state as input for fix, not just error message.
- **Full ticket-to-PR pipeline with no human touch** — end-to-end architecture reference.
