---
name: new-client-project
description: Scaffold the folder structure for a new client/project under `clients/` with the standard subdirs (transcripts/raw, transcripts/processed, meetings) and a starter `project-state.md` from the template. Use when the user says "nuevo proyecto de cliente", "crear carpeta cliente", "init engagement", "scaffold client", or invokes `/new-client-project`. Idempotent — refuses to overwrite an existing engagement.
---

# new-client-project — scaffold an engagement under `clients/`

## When to invoke

User says any of:
- "nuevo proyecto de cliente <slug>/<slug>"
- "crea carpeta para <client> / <project>"
- "init engagement <client>/<project>"
- "scaffold client <client> project <project>"
- `/new-client-project <client>/<project>` (slash command form)

## Inputs

Two slugs in **kebab-case**: `<client-slug>` and `<project-slug>`.

Accept any of these input formats:
- `acme-bank/risk-platform` (compound)
- `acme-bank risk-platform` (space-separated)
- Conversational: "acme bank, project risk platform" — normalize to kebab-case
- No args provided → ask the user via AskUserQuestion for both slugs

## Validation

Each slug must match `^[a-z][a-z0-9-]*$`:
- lowercase letters, digits, hyphens
- starts with a letter
- no spaces, no underscores, no uppercase

If the user provides an invalid slug, normalize what you can (lowercase, replace spaces with hyphens, strip accents) and confirm with them before continuing.

## Steps

1. **Locate the repo root.** Find the directory containing `clients/` (typically `/Users/polo/workspace/qa`). If you can't find one, the user is in the wrong directory — tell them.

2. **Check for existing engagement.** If `clients/<client>/<project>/` already exists:
   - Do NOT overwrite anything.
   - Report what's already there (use `ls` + count files).
   - Stop. This skill is a scaffolder, not a sync.

3. **Create directories** in one command:
   ```bash
   mkdir -p clients/<client>/<project>/{transcripts/raw,transcripts/processed,meetings}
   ```

4. **Create `clients/<client>/<project>/project-state.md`** using the template below. Substitute:
   - `{{CLIENT_HUMAN}}` — `<client-slug>` with hyphens to spaces and Title Case (`acme-bank` → `Acme Bank`)
   - `{{PROJECT_HUMAN}}` — same treatment for `<project-slug>`
   - `{{TODAY}}` — today's date in `YYYY-MM-DD` (UTC or local, your choice — be consistent)

5. **Confirm in 2-3 lines**: show the absolute path created, count of dirs/files, and remind the user of the next step (drop transcripts in `transcripts/raw/`, then ask "procesa la reunión").

## Template — `project-state.md`

```markdown
# {{CLIENT_HUMAN}} / {{PROJECT_HUMAN}} — Estado

## Snapshot
- Inicio: {{TODAY}}
- Última reunión: —
- Status: discovery

## Necesidades de testing (consolidadas)

_(vacío — se rellena tras la primera reunión procesada)_

## Cobertura por nworld-qa-framework
- ✅ Lo que ya cubre: —
- ⚠️ Parcial: —
- ❌ Gaps: —

## Histórico de reuniones
- _(vacío)_
```

## Idempotency contract

- **Never** overwrite an existing `project-state.md`, `transcripts/`, or `meetings/`.
- If the project already exists, surface what's there and stop.
- Re-running the skill on an existing engagement is a no-op + status report.

## Why this skill exists

The `clients/` folder is **gitignored** (the repo is public, transcripts contain client data). New engagements get scaffolded locally and never touch the remote. This skill removes the friction of remembering the exact mkdir pattern and ensures every new engagement starts with the same `project-state.md` template, so downstream "procesa la reunión" workflows have a consistent target.

See `clients/README.md` for the full workflow context (templates for per-meeting analysis, how transcripts feed into `research/client-signals.md`, etc.).
