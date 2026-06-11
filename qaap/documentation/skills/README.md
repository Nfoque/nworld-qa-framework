# Skills

7 Claude Code skills (slash commands) for scaffolding VSA + Domain structures in the QAAP SPA. Each `.md` file is a skill that can be installed as a slash command.

## Installation

Copy skills to the target project's `.claude/commands/` directory:

```bash
mkdir -p .claude/commands
cp /path/to/documentation/skills/*.md .claude/commands/
```

Then invoke in Claude Code as `/create-domain`, `/create-feature`, etc.

## Skill Catalog

| Skill | Input | What it does |
|---|---|---|
| `/create-domain` | `{name}` | Scaffold domain folder + README + features/ + shared/ |
| `/create-feature` | `{domain}/{feature}` | Scaffold .tsx, .css, .types.ts, .adapter.ts, .service.ts, .test.tsx, README |
| `/create-component` | `{scope} {name}` | Shared component at the correct scope level (rule of 3) |
| `/create-environment` | `{env-name}` | Environment config + pnpm script + Playwright project |
| `/create-mock-fixture` | `{procedure}` | MSW handler + JSON fixture for a tRPC procedure |
| `/create-e2e-spec` | `{domain}/{feature}` | Playwright spec mapped to a feature |
| `/verify` | `quick` or `full` | Lint + types + tests + architectural validation |

## Dependencies

Skills reference the ADR documentation from `../adr/`. They work best when the project follows the VSA + Domain structure described in those docs.

## Language

All skills are written in English. They generate English code, comments, and documentation.
