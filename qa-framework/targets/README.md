# Targets

Projects against which the framework is validated. Any web project with components
and (optionally) an OpenAPI spec can be a target.

## Minimum requirements for a target

- Components with `data-testid` (or willingness to add them)
- Route or URL where the feature under test is served
- Optionally: backend OpenAPI spec (enriches the generation context)

## Validation sequence

1. **PoC:** simple archetype project (few features, standard stack)
2. **Pilot:** real team project with medium complexity
3. **Rollout:** remaining projects in order of complexity

> **Pending:** candidate projects will be defined once the source code parser
> is operational and it becomes possible to evaluate which projects meet the
> minimum requirements with real data (existing testIds, current coverage,
> router complexity).
