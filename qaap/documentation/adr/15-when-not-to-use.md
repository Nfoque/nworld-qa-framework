# When NOT to Use VSA + Domain

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 10

## Premise

VSA + Domain is not a silver bullet. There are contexts where other architectures remain superior. Applying the pattern outside its zone of applicability produces the same problems as the architectures it criticizes.

## Four Cases Where You Shouldn't Use It

### 1. Systems with Critical, Long-Lived Domain Logic

In systems where the domain is complex, business rules are critical (financial, medical, legal), and the code lives 10-20 years, **Clean or Hexagonal protect invariants that VSA does not guarantee**.

A banking core, an air traffic control system, or a medical platform have legitimate reasons to prefer Clean Architecture: the separation of layers allows formally verifying that domain logic is not contaminated with infrastructure details.

**Key signal**: the domain model has complex invariants that must be enforced across all entry points (API, batch, CLI, events).

### 2. Exclusively Human Teams with High Rotation

If the team is 100% human and rotates frequently, the clear separation of layers aids onboarding. A new developer can learn "the services" without understanding the entire domain.

In agentic teams this advantage disappears: **agents don't onboard — every session starts from zero**.

**Key signal**: no AI agents in the development workflow, and the team changes members every few months.

### 3. Logic Reused Across Many Channels

If the same business logic serves web, mobile, batch jobs, CLI, and public APIs, the rigorous separation of pure domain shines. The domain is reused; the adapters change.

VSA + Domain works here but loses some of its comparative advantages.

**Key signal**: the same domain model is consumed by 4+ fundamentally different entry points with different protocols.

### 4. Small Systems with a Single Functional Domain

If the system has fewer than 10-15 features and they all belong to the same domain, the `domains/` layer is overhead.

In this case, plain VSA without a domain layer is preferable: `src/features/{feature}/` directly.

**Key signal**: you can't think of more than one meaningful domain name.

## The Anti-Pattern to Avoid

The most common mistake is adopting VSA *partially*, combining it with a hexagonal layer "to get the best of both worlds."

> The result is the worst of both worlds: a layer per feature multiplied by a layer per architecture.

If you choose VSA + Domain, **you commit**: features are the unit of organization, not technical layers.

## Related Docs

- [01 — Architecture Principles](./01-architecture-principles.md) — the principles that define the applicability zone
- [16 — Migration Guide](./16-migration-guide.md) — how to migrate when VSA does apply
