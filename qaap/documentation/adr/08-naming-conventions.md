# Naming Conventions

> Source: K.A.I — VSA + Domain Layer v3.0, chapter 07

## Why Naming Matters More Than Usual

Path predictability is the most valuable property of the pattern, but it **only works if naming conventions are strictly respected**.

When conventions are followed, the agent doesn't explore the repository — it **navigates directly**. Given a functional requirement, the code path is calculable, not searchable.

## The 4 Minimum Rules

### 1. Descriptive kebab-case

```
create-invoice       ✅
CreateInvoice        ❌
create_invoice       ❌
createInvoice        ❌
```

Applies to: folder names, file names, feature names, domain names.

Exception: React component exports use PascalCase by convention (`export const CreateInvoice`), but the file is `create-invoice.tsx`.

### 2. Same name across repositories

Where a feature appears (frontend, backend, mobile), it has the **same name**. `create-invoice` in the SPA, `create-invoice` in the BFF, `create-invoice` in the API spec.

This enables cross-repo navigation without translation.

### 3. Immutability

Once named, a feature or domain **does not change names** except via atomic refactor (rename everywhere simultaneously in a single commit).

Names are the navigation API. Changing them breaks every reference, every agent's learned paths, and every document that mentions them.

### 4. Business vocabulary

Names reflect **domain concepts**, not technical details:

```
list-products        ✅  (business concept)
product-table        ❌  (UI component name)
get-products-page    ❌  (technical action)
products-container   ❌  (React pattern leak)
```

The name should make sense to the Product Owner, not just to the developer.

## File Naming Within a Feature

All files in a feature share the same prefix:

```
list-products/
  list-products.tsx              ← entry point
  list-products.css              ← styles
  list-products.service.ts       ← API/data layer
  list-products.types.ts         ← types and models
  list-products.adapter.ts       ← API → frontend model adapter
  list-products.test.tsx         ← tests
  list-products-filters.tsx      ← internal subcomponent
  list-products-table.tsx        ← internal subcomponent
```

Benefits:
- `ls` tells you everything without opening files
- No ambiguity about which feature a file belongs to
- Easy to grep across the project

## Domain Naming

Domains use the **same business vocabulary** the Product Owner uses:

```
catalog/             ✅  (business area)
orders/              ✅  (business area)
quality-control/     ✅  (business area)
components/          ❌  (technical category)
utils/               ❌  (technical junk drawer)
shared/              ❌  (this is a reserved structural name, not a domain)
```

## CSS Class Naming (BEM)

All CSS classes follow **BEM (Block Element Modifier)** methodology, adapted for VSA features.

### Core Concepts

| BEM Term | Meaning | Separator | Example |
|----------|---------|-----------|---------|
| **Block** | The feature itself | — | `.list-products` |
| **Element** | A part inside the block | `__` | `.list-products__toolbar` |
| **Modifier** | A variation of a block or element | `--` | `.list-products--loading` |

### The Feature = The Block

The **feature name IS the block name**. There is no `-root`, `-container`, or `-wrapper` suffix — the feature's top-level element uses the bare feature name as its class:

```css
/* ✅ Correct */
.list-products { }
.list-products__toolbar { }
.list-products__card { }
.list-products__card--selected { }

/* ❌ Wrong — redundant suffixes */
.list-products-root { }
.list-products-container { }
.list-products-wrapper { }

/* ❌ Wrong — flat naming without BEM separators */
.list-products-toolbar { }
.list-products-card { }
```

### Rules

1. **One block per feature** — the block name matches the feature's kebab-case name exactly
2. **Elements use `__`** — every child selector is `{feature}__{element}`
3. **Modifiers use `--`** — state variants are `{feature}--{modifier}` or `{feature}__{element}--{modifier}`
4. **No nesting of blocks** — if a child component is complex enough to be its own block, it should be a subcomponent with its own BEM namespace (prefixed by the feature name)
5. **No generic class names** — never use `.card`, `.toolbar`, `.header` alone; always scope to the feature block

### Complete Example

Feature `order-summary`:

```css
/* order-summary.css */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: var(--ids-size-100);
}

.order-summary__header {
  display: flex;
  justify-content: space-between;
}

.order-summary__table {
  width: 100%;
}

.order-summary__row {
  border-bottom: 1px solid var(--ids-color-border-default);
}

.order-summary__row--highlighted {
  background-color: var(--ids-color-bg-accent);
}

.order-summary__footer {
  padding: var(--ids-size-100);
}

.order-summary--loading {
  opacity: 0.5;
  pointer-events: none;
}
```

```tsx
/* order-summary.tsx */
<div className={`order-summary${isLoading ? " order-summary--loading" : ""}`}>
  <div className="order-summary__header">...</div>
  <table className="order-summary__table">
    <tr className={`order-summary__row${isActive ? " order-summary__row--highlighted" : ""}`}>
      ...
    </tr>
  </table>
  <div className="order-summary__footer">...</div>
</div>
```

### Multi-word Feature Names

For features with multi-word kebab-case names, the full name is the block:

```css
.how-are-you { }              /* block = feature name */
.how-are-you__summary { }     /* element */
.how-are-you__card { }        /* element */
.how-are-you__card--active { } /* modifier on element */
```

### What BEM Prevents

| Anti-pattern | Problem | BEM solution |
|--------------|---------|--------------|
| `.root`, `.container` | Collisions across features | `.{feature}` as unique block |
| `.card`, `.toolbar` | Global scope leaks | `.{feature}__card`, `.{feature}__toolbar` |
| `.feature-card` | Ambiguous — is `card` an element or part of the name? | `.feature__card` with `__` separator |
| Deeply nested selectors (`.a .b .c`) | Specificity wars, fragile | Flat BEM classes, no nesting needed |

## Related Docs

- [03 — Feature Anatomy](./03-feature-anatomy.md) — file structure within a feature
- [04 — Domain Layer](./04-domain-layer.md) — domain delimitation
- [01 — Architecture Principles](./01-architecture-principles.md) — principle 03 (path predictability)
