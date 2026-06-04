# Parser: Jira/Story

> Status: **spec draft** — strategy defined from Nesvitii research, no implementation yet
>
> Origin: Nesvitii — MCP + Playwright + Jira E2E Automation (normalisation step pattern)

## What it does

Given a Jira ticket key, extracts testable requirements via a **normalisation step**: a dedicated, cheap LLM call that converts freeform ticket descriptions (Gherkin, bullets, prose — every engineer writes differently) into structured JSON. The pipeline principal never sees ambiguous input.

This is the one parser where LLM use is justified — ticket format is genuinely freeform and unparseable with static analysis alone.

## Strategy: Normalisation Step

```
Jira API response (freeform description + AC + comments)
  │
  ▼
LLM normalisation call (cheap: classification task type, Sonnet, max_tokens ~1000)
  │  System: "Extract testable assertions from Jira tickets.
  │           Return ONLY valid JSON. No preamble. No markdown."
  │
  ▼
Structured JSON: { assertions[], preconditions[], userRole, feature }
  │
  ▼
Pipeline principal receives clean, unambiguous requirements
```

**Why a dedicated LLM call instead of parsing in the main prompt:**
- Separates parsing from reasoning — the main agent never guesses what the ticket is asking for
- Allows validating extraction quality before spending tokens on generation
- Uses a small/fast model (classification task type) — not the expensive generation model
- Can be cached per ticket version (same ticket content → same normalisation output)

## Input

- Jira ticket key (e.g.: `ICMF-1234`)
- Access to Jira API (authentication via connector)

## Raw input from Jira API

The parser fetches via the Jira connector:
- `summary` — ticket title
- `description` — freeform body (Jira markup)
- `acceptance_criteria` — if using a custom field, or embedded in description
- `labels` — for routing and filtering
- `linked_tickets` — parent epic, related stories
- `story_points` — complexity signal
- `comments` — may contain clarifications from PO

## Normalisation prompt

```typescript
const normalize = await llmClient.chat({
  model: router.resolve('classification'),  // small/fast model
  maxTokens: 1000,
  messages: [
    {
      role: 'system',
      content: 'You extract testable assertions from Jira tickets. '
             + 'Return ONLY valid JSON. No preamble. No markdown.'
    },
    {
      role: 'user',
      content: `Ticket description:\n${ticket.description}\n\n`
             + `Return JSON: { assertions: string[], preconditions: string[], `
             + `userRole: string, feature: string }`
    }
  ],
  responseFormat: { type: 'json_schema', schema: JiraContextSchema }
});
```

## Output schema

```typescript
interface JiraContext {
  ticketKey: string;
  summary: string;
  type: 'Story' | 'Bug' | 'Task';
  feature: string;                    // What feature area this ticket covers
  userRole: string;                   // "admin", "buyer", "supplier", etc.
  assertions: {
    index: number;
    text: string;                     // Testable assertion extracted from AC
  }[];
  preconditions: string[];            // What must be true before the test starts
  userFlow: string[] | null;          // Ordered steps if a flow is described
  xrayTag: string;                    // @XRAY-{KEY} for traceability
  linkedTickets: string[];            // Related ticket keys
  normalisationConfidence: number;    // 0-1: how confident the LLM is in the extraction
}
```

## Expected output (context for the prompt)

```
Ticket: ICMF-1234 — List Products with Filters
Type: Story
Feature: Product Catalog
User Role: buyer

Assertions:
1. The user can filter products by status (active/inactive)
2. The table shows name, status, and last modification date
3. If there are no results, a "No products found" message is shown
4. The "Search" button applies the selected filters

Preconditions:
- User is authenticated as buyer
- At least 5 products exist in the system (mix of active/inactive)

Main flow:
1. Navigate to /catalog/list-products
2. Select status filter
3. Click "Search"
4. Verify filtered results

Normalisation confidence: 0.92
```

## Quality validation

Before passing to the assembler, validate the normalisation output:
1. **assertions[] is non-empty** — if the LLM couldn't extract any, flag for human review
2. **assertions are testable** — each should describe an observable behaviour, not an implementation detail
3. **normalisationConfidence >= 0.60** — below this, the ticket is too ambiguous for automation; route to human
4. **No invented details** — the normalisation must only extract what's in the ticket, not infer missing requirements

## Dependencies

- Jira connector (Phase 2 in QAAP, or direct REST API call in qa-framework)
- LLM client with `classification` task type routing
- Structured output support (JSON schema response format)

## Existing base

No implementation exists. The `create-e2e-spec` skill accepts a Jira key as optional input, but only uses it for the `@XRAY-{KEY}` tag — it does not read the ticket's content.

## Relationship to QAAP

In QAAP, this parser runs as a sub-stage of Stage 1 (Parse) in the LLM pipeline. The normalisation call uses the `classification` task type from the LLM Router — same model used for failure classification (small, fast, cheap).
