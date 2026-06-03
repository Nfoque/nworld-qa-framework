# Parser: Jira/Story

> Status: **placeholder** — genuinely new, no base in the pilot

## What it would do

Given a Jira ticket key, extract:

1. **Acceptance criteria** — each AC becomes a candidate test case
2. **User flows** — sequences described in the story
3. **XRay tag** — to link the generated spec with the ticket

## Input

- Jira ticket key (e.g.: `ICMF-1234`)
- Access to Jira API (authentication)

## Expected output (context for the prompt)

```
Ticket: ICMF-1234 — List Products with Filters
Type: Story
Status: In Progress

Acceptance criteria:
1. The user can filter products by status (active/inactive)
2. The table shows name, status, and last modification date
3. If there are no results, a "No products found" message is shown
4. The "Search" button applies the selected filters

Main flow:
1. Navigate to /catalog/list-products
2. Select status filter
3. Click "Search"
4. Verify filtered results
```

## Output schema

```typescript
interface JiraContext {
  ticketKey: string;
  summary: string;
  type: 'Story' | 'Bug' | 'Task';
  acceptanceCriteria: {
    index: number;
    text: string;
  }[];
  userFlow: string[] | null;
  xrayTag: string;
}
```

## Why there's no existing base

The pilot focuses on code structure and the OpenAPI spec as inputs.
Jira as a generation input is a different channel that has not been explored.

The `create-e2e-spec` skill accepts a Jira key as optional input, but only uses it for
the `@XRAY-{KEY}` tag — it does not read the ticket's content.

## Dependencies

- Access to Jira API (token, base URL)
- Jira MCP server or direct call to the REST API
- Parsing of description/AC (Jira uses its own markup)
