# Create Component

Create a shared component at the correct scope level following the rule of 3.

## Input

$ARGUMENTS = `{scope} {component-name}` where scope is one of:
- `domain:{domain-name}` — shared within a specific domain (`domains/{X}/shared/`)
- `global` — shared across all domains (`src/shared/components/`)

Example: `domain:catalog product-card` or `global status-badge`

## Instructions

1. Parse the input:
   - Extract scope and component name
   - Validate component name is kebab-case
   - If domain-scoped, verify the domain exists

2. Determine the target path:
   - `domain:{name}` → `src/domains/{name}/shared/{component-name}/`
   - `global` → `src/shared/components/{component-name}/`

3. Before creating, verify the component doesn't already exist at the target path.

4. Ask the user if this component is used by 3+ consumers (rule of 3 check). If not, suggest keeping it inside the feature that uses it instead of creating a shared component.

5. Create the component files:

```
{target-path}/{component-name}/
  {component-name}.tsx
  {component-name}.css
  {component-name}.test.tsx
```

### {component-name}.tsx
```typescript
import "./{component-name}.css";
import React from "react";

export type {ComponentName}Props = {
  testId?: string;
  // TODO: Add props
};

export const {ComponentName}: React.FC<{ComponentName}Props> = ({ testId }) => {
  return (
    <div data-testid={testId} className="{component-name}">
      {/* TODO: Implement */}
    </div>
  );
};
```

### {component-name}.test.tsx
```typescript
import { render, screen } from "@testing-library/react";
import { {ComponentName} } from "./{component-name}";

describe("{ComponentName}", () => {
  it("renders without crashing", () => {
    render(<{ComponentName} testId="test" />);
    expect(screen.getByTestId("test")).toBeInTheDocument();
  });
});
```

6. Report what was created, including the full import path for consumers.

## Notes

Components are generated with `data-testid` prop by default. This ensures the source code
parser (`parsers/source-code/`) can find testIds for E2E spec generation.
