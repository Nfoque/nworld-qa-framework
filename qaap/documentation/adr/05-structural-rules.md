# Structural Rules

> Source: K.A.I — VSA + Domain Layer v3.0, chapters 05, 07

## The 5 Hard Rules

These rules are non-negotiable. They maintain the integrity of the pattern. Breaking any of them degrades the architecture for all agents and humans.

### Rule 1 — No cross-feature imports

A feature **never** imports code from another feature directly.

```
// FORBIDDEN
import { something } from '../other-feature/other-feature.service';

// CORRECT — promote to shared if needed by 3+ consumers
import { something } from '../../shared/something';
```

**How to verify**: `grep` for imports between feature folders. Zero matches = compliant.

### Rule 2 — No cross-domain imports

A domain **never** imports code from another domain directly.

```
// FORBIDDEN
import { util } from '../../other-domain/shared/util';

// CORRECT — promote to src/shared/
import { util } from '../../../shared/util';
```

**How to verify**: Check that no file under `domains/X/` imports from `domains/Y/`.

### Rule 3 — Domain shared belongs to the domain

Code in `domains/{X}/shared/` is used **only** by features within domain `{X}`. No other domain touches it.

**How to verify**: Scan imports of `domains/{X}/shared/` — all consumers must be under `domains/{X}/features/`.

### Rule 4 — Global shared is for everyone

Code in `src/shared/` is the **only** crossing point between domains. It's consumed by features from any domain.

**How to verify**: Code in `src/shared/` should not import from any `domains/` folder.

### Rule 5 — Names are immutable

Domain and feature names, once established, do not change — except via atomic refactor (rename everywhere simultaneously).

**Why**: Names are the navigation API. Changing them breaks every reference, every agent's learned paths, and every document that mentions them.

## Automated Validation

A predictable architecture only stays predictable if it **stays predictable**. Implement a CI linter that validates each feature follows the expected pattern:

- Folder in the correct location
- Required files present
- No cross-feature imports
- No cross-domain imports

Without automated validation, the structure degenerates over time.

## ESLint Rule Example (import boundaries)

```javascript
// eslint config — restrict cross-feature imports
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        '../*/features/*',           // no sibling feature imports
        '../../*/features/*',        // no cousin feature imports
        '../../../domains/*/features/*'  // no cross-domain feature imports
      ]
    }]
  }
}
```

## Related Docs

- [01 — Architecture Principles](./01-architecture-principles.md) — why these rules exist
- [06 — Decision Rules](./06-decision-rules.md) — how to decide where code should live
- [07 — Complex Cases](./07-complex-cases.md) — what to do when rules feel limiting
