# Create Mock Fixture

Create an MSW handler and JSON fixture for a tRPC procedure.

## Input

$ARGUMENTS = tRPC procedure name (e.g., `plan.list`, `plan.create`, `connector.test`)

## Instructions

1. Read `documentation/adr/12-mock-server.md` for the MSW handler pattern and fixture structure.

2. Parse the input:
   - Extract the tRPC procedure path (e.g., `plan.list`)
   - Determine the domain from the first segment (e.g., `plan` → plans domain)
   - Determine if it's a query or mutation (`.list`, `.getById` → query; `.create`, `.update`, `.delete` → mutation)

3. Check if the tRPC router defines this procedure:
   - Look in `apps/api/src/trpc/` or `apps/api/src/modules/` for the router definition
   - Extract the input/output types if available

4. Create the fixture file:

### `src/mocks/fixtures/{domain}.json`

If the fixture file exists, add the new data. If not, create it:

```json
{
  "items": [
    { "id": "1", "name": "Sample Item 1" },
    { "id": "2", "name": "Sample Item 2" },
    { "id": "3", "name": "Sample Item 3" }
  ]
}
```

Generate realistic sample data based on the procedure's output type. For arrays, generate 3-5 items with varied data.

5. Create or update the handler file:

### `src/mocks/handlers/{domain}.ts`

```typescript
import { http, HttpResponse } from "msw";
import fixture from "../fixtures/{domain}.json";

export const {domain}Handlers = [
  http.post("/api/trpc/{procedure}", () => {
    return HttpResponse.json({ result: { data: fixture } });
  }),
];
```

6. Export the new handlers from `src/mocks/handlers.ts`:

```typescript
import { {domain}Handlers } from "./handlers/{domain}";

export const handlers = [
  // ... existing handlers
  ...{domain}Handlers,
];
```

7. Report what was created and how to test it:
   ```
   VITE_MOCK_API=true pnpm dev
   ```
