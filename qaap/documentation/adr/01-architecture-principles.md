# Architecture Principles

> Source: K.A.I — VSA + Domain Layer v3.0, chapters 01, 04, 11

## Central Thesis

Traditional architectures optimize for future flexibility. Agentic architectures must optimize for present precision. VSA + Domain prioritizes the latter without sacrificing long-term maintainability.

## The Paradigm Shift

For forty years, software architectures (Hexagonal, Clean, Layered, DDD) were designed for human developers who have persistent memory, intuition, and can absorb tribal knowledge over time.

AI agents have a radically different cognitive profile:

- **No memory between sessions** — every interaction starts from scratch
- **Finite, costly context** — every token read has a measurable economic cost
- **No tribal knowledge** — they can't ask colleagues or read an internal wiki
- **Performance degrades** past ~40% context utilization
- **Strictly syntactic access** — if it's not explicit in files, it doesn't exist

The question that matters: **What pattern organizes code optimally when the developer is an agent?**

The answer: Vertical Slice Architecture combined with a functional domain layer.

## The 7 Guiding Principles

### 01 — The feature is the atomic unit of change

Every architectural decision must preserve the property that a feature lives in a single folder and is modified as a unit. Any pattern that distributes a feature across multiple folders violates this property.

### 02 — Domains reflect business language

Domain names match concepts a Product Owner uses naturally. They don't reflect technology, organizational structure, or technical layers. They are functional business areas.

### 03 — Path predictability is non-negotiable

Given a functional requirement, the code path must be calculable deterministically. If it requires search, exploration, or intuition, the architecture has failed its primary purpose.

### 04 — Explicit over implicit

Any convention an agent must respect must be codified in the repository structure or documented accessibly. Tribal knowledge does not scale to agentic teams.

### 05 — The rule of 3

Something is promoted to a higher scope only when demonstrably used by 3 or more consumers. Below that threshold, duplicate. This rule protects feature independence.

### 06 — When in doubt, choose the lower level

Promoting is cheap; demoting is expensive. Keeping something at the lowest possible scope is always the correct default decision.

### 07 — Optimize for present precision, not future flexibility

Architectural flexibility for "swapping databases" or "switching implementations" rarely materializes. Agents can refactor at speeds humans can't. Optimizing for future flexibility has a certain present cost and an improbable future benefit.

## Related Docs

- [02 — Directory Structure](./02-directory-structure.md) — how these principles materialize in folders
- [05 — Structural Rules](./05-structural-rules.md) — the hard rules that enforce these principles
- [15 — When NOT to Use](./15-when-not-to-use.md) — where these principles don't apply
