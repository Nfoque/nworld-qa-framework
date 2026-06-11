# Create Environment

Add a new environment configuration (env vars + pnpm script + Playwright project).

## Input

$ARGUMENTS = environment name (e.g., `staging`, `int`, `local-bff`)

## Instructions

1. Read `documentation/adr/14-developer-environment.md` for the environment structure and script patterns.

2. Read the existing environment configuration:
   - `spa/.env.local` (local defaults)
   - `spa/.env.example` (template)

3. Create or update environment file:

### `spa/.env.{env-name}`

```env
VITE_SUPABASE_URL=<backend-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_MOCK_API=false
```

Ask the user for the Supabase URL and anon key if not obvious from the environment name.

4. Add pnpm script to `spa/package.json`:

```json
"dev:{env-name}": "vite --mode {env-name}"
```

5. If the environment needs E2E testing, add a project entry to `e2e/playwright.config.ts`:

```typescript
{
  name: "{env-name}",
  use: {
    baseURL: "{frontend-url}",
    ...devices["Desktop Chrome"],
  },
},
```

6. Report what was created and how to use the new environment.
