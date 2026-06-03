# Create Domain

Scaffold a new domain in the VSA + Domain architecture.

## Input

$ARGUMENTS = domain name in kebab-case (e.g., `quality-control`)

## Instructions

1. Validate the domain name:
   - Must be kebab-case
   - Must reflect a business area (not a technical concept)
   - Must not already exist in `src/domains/`

2. Create the domain folder structure:

```
src/domains/{domain-name}/
  README.md
  features/
  shared/
```

3. Write the README.md:

```markdown
# {Domain Name}

{Brief description: what business area this domain covers}

## Features

_No features yet. Use `/create-feature` to add the first one._

## Shared

_No shared code yet. Code is promoted here when 3+ features of this domain need it._

## Dependencies

- Uses `src/shared/api/` for HTTP client
- Uses `src/shared/auth/` for user context
```

4. Report what was created and suggest next steps (e.g., "Run `/create-feature {domain-name}/feature-name` to add the first feature").
