# Domain Layer

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 04

## Why Domains Exist

VSA alone works for small repositories. With 40, 60, or 100 features, a flat list becomes noise. The domain layer groups features by **functional business area**: the same concepts the Product Owner uses.

If the business manages billing, reports, and notifications, those are the domains: `billing/`, `reports/`, `notifications/`. The code vocabulary and the product vocabulary coincide. No translation, no ambiguity.

## Deterministic Navigation

Given a requirement in business language, the code path is **calculable without search**. The agent's reasoning always follows the same sequence:

1. **Locate the domain** — which functional area does the requirement belong to?
2. **Locate the feature** — does it exist already, or should it be created?
3. **Enter the folder** — everything needed is right there

## Domain Structure

```
domains/
  {domain-name}/
    README.md          ← Business context, ownership, bounded context
    features/
      {feature-a}/
      {feature-b}/
    shared/            ← Shared ONLY within this domain
```

## How to Delimit Domains

Domains map to **functional business areas**, not:
- Technical layers (don't create `api/`, `ui/`, `state/` as domains)
- Team structure (don't create `team-alpha/`, `team-beta/`)
- Infrastructure (don't create `auth/`, `logging/` as domains — those go in `src/shared/`)

Good domain names: `catalog`, `orders`, `quality-control`, `purchases`, `notifications`
Bad domain names: `components`, `services`, `utils`, `common`, `core`

## Domain README Template

```markdown
# {Domain Name}

{One paragraph: what business area this domain covers}

## Features

- **{feature-a}** — {what it does}
- **{feature-b}** — {what it does}

## Shared

- **{shared-module}** — {what it provides and who uses it within this domain}

## Dependencies

- Uses `src/shared/api/` for HTTP client
- Uses `src/shared/auth/` for user context

## Ownership

{Team or person responsible}
```

## Properties Comparison

| Property | Horizontal architectures | VSA + Domain |
|---|---|---|
| Locate a change | Search across N layers | Navigate to 1 folder |
| Impact of a change | Potentially global | Contained to the slice |
| Parallel work | Conflicts on shared files | Independent features |
| Remove functionality | Surgery across multiple layers | Delete one folder |
| Scale the system | Cross-layer refactoring | Extract a domain |

## Related Docs

- [01 — Architecture Principles](./01-architecture-principles.md) — the principles that drive domain design
- [06 — Decision Rules](./06-decision-rules.md) — how to decide where code lives
- [07 — Complex Cases](./07-complex-cases.md) — cross-domain data sharing
