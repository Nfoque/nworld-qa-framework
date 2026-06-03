# Create Environment

Add a new environment configuration (configmap + npm script + Playwright project).

## Input

$ARGUMENTS = environment name (e.g., `staging`, `int`, `local-bff`)

## Instructions

1. Read the existing configmaps to understand the current structure:
   - `config/application-configmap.yml` (local default)
   - `config/application-configmap_mock.yml` (if exists)
   - `config/application-configmap_pre.yml` (if exists)

2. Create a new configmap file:

### `config/application-configmap_{env-name}.yml`

Copy the structure from the closest existing configmap and adjust:
- `amiga.api.baseUrl` — the backend URL for this environment
- `amiga.authentication.type` — `mocked` or `oauth2`
- `amiga.microfrontends` — remote URLs for this environment

Ask the user for the backend URL and auth type if not obvious from the environment name.

3. Add npm script to `package.json`:

```json
"start:{env-name}": "CONFIGMAP={env-name} amiga-scripts start"
```

4. Add E2E testing support (see `architecture/adr-002-playwright-setup.md`):

```json
"test:e2e:{env-name}": "playwright test --project={env-name}"
```

And add a project entry to `e2e/playwright.config.ts`:

```typescript
{
  name: "{env-name}",
  use: {
    baseURL: "{frontend-url}",
    ...devices["Desktop Chrome"],
  },
},
```

5. Report what was created and how to use the new environment.
