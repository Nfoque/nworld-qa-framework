# Decision Rules

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 09

## Purpose

For the structure not to degenerate over time, all agents and humans must apply the same decision rules. These rules answer the daily question: **where does this code live?**

## Scope Hierarchy

| If the data/logic... | It lives in... |
|---|---|
| Is used by only one feature | `domains/{X}/features/{Y}/` |
| Is shared by 3+ features of the same domain | `domains/{X}/shared/` |
| Is shared by 3+ features of different domains | `src/shared/` |

Always start at the most local level possible and only promote when there's real evidence of need.

## The Rule of 3

The central decision heuristic:

- **1 consumer** → lives in the feature
- **2 consumers** → **duplicate** (yes, duplication is fine)
- **3+ consumers** → **promote** to `shared/` at the appropriate level

Why? Premature abstraction costs more than duplication. Two features that seem to share logic today may diverge tomorrow.

### The Key Question

It's not "is this code duplicated?" but rather: **"if this feature changes, should it force changes in other features?"**

- If **yes** → share it
- If **no** → duplicate it

Traditional architectures optimize for the first question. VSA + Domain optimizes for the second.

## Promotion and Demotion

### Promotion (bottom → up)

A utility is promoted to a higher scope only when **demonstrably used by 3 or more consumers**. Not by anticipation, not by DRY aesthetics, not by "we'll probably need it."

The prediction of reuse in architecture is notoriously bad: most "shared" utilities anticipated never get reused.

**Promotion is a mechanical refactor.** Move the file, update imports, done.

### Demotion (top → down)

If something in `shared/` turns out to only be used by one feature, bring it back down into that feature.

**Demotion is a surgical operation.** It requires understanding which dependencies exist and breaking them carefully.

### The Asymmetry

> Promotion is cheap; demotion is expensive. When in doubt between two levels, choose the lower one.

## Duplication vs. Premature Coupling

Duplicating 20 lines of code is a **countable cost**.

Coupling two features because they share a utility — when they'll actually evolve differently — is a **systemic cost** that's only discovered when it's already expensive to revert.

## Hard Rules That Always Apply

Regardless of the scope decision:

1. A feature never imports from another feature directly
2. A domain never imports from another domain directly
3. Domain and feature names are immutable except via atomic refactor

## Related Docs

- [05 — Structural Rules](./05-structural-rules.md) — the import constraints
- [07 — Complex Cases](./07-complex-cases.md) — shared data, cross-feature communication
- [01 — Architecture Principles](./01-architecture-principles.md) — principle 05 (rule of 3) and 06 (lower level)
