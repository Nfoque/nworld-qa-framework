# Create Feature

Scaffold a new feature inside an existing domain following VSA + Domain anatomy.

## Input

$ARGUMENTS = `{domain}/{feature-name}` (e.g., `catalog/list-products`)

## Instructions

1. Read `documentation/adr/03-feature-anatomy.md` and `documentation/adr/08-naming-conventions.md` for context.

2. Parse the input:
   - Extract `{domain}` and `{feature-name}` from the argument
   - Validate both are kebab-case
   - Verify the domain exists in `src/domains/`
   - Verify the feature does not already exist

3. Create the feature folder with all standard files:

```
src/domains/{domain}/features/{feature-name}/
  {feature-name}.tsx
  {feature-name}.css
  {feature-name}.service.ts
  {feature-name}.types.ts
  {feature-name}.adapter.ts
  {feature-name}.test.tsx
  README.md
```

4. Generate file contents:

### {feature-name}.tsx
```typescript
import "./{feature-name}.css";
import React from "react";

export type {FeatureName}Props = {
  testId?: string;
};

export const {FeatureName}: React.FC<{FeatureName}Props> = ({ testId }) => {
  return (
    <div data-testid={testId} className="{feature-name}">
      <h2>{Feature Name}</h2>
    </div>
  );
};

export default {FeatureName};
```

Convert `{feature-name}` to PascalCase for the component name and to Title Case for the display name.

### {feature-name}.css
```css
.{feature-name} {
  /* styles */
}
```

### {feature-name}.service.ts
```typescript
import { useQuery } from "@tanstack/react-query";
import { useBFF } from "@/shared/api/use-bff";

const keyFactory = {
  all: () => ["{feature-name}"],
};

// TODO: Implement query hooks for this feature
```

### {feature-name}.types.ts
```typescript
// API model (from generated types or OpenAPI spec)
// import type { ApiModel } from "@/shared/api/generated-types/...";

// Frontend model
export interface {FeatureName}Item {
  id: string;
  // TODO: Define frontend model fields
}

// Adapter: API → Frontend
// export function adapt{FeatureName}(api: ApiModel): {FeatureName}Item { ... }
```

### {feature-name}.adapter.ts
```typescript
// Adapter functions: API models → Frontend models
// Import API types from generated types or OpenAPI spec package
// Import frontend types from ./{feature-name}.types

// export function adaptResponse(apiData: ApiType): FrontendType { ... }
```

### {feature-name}.test.tsx
```typescript
import { render, screen } from "#/test.utils";
import { {FeatureName} } from "./{feature-name}";

describe("{FeatureName}", () => {
  it("renders without crashing", () => {
    render(<{FeatureName} testId="test" />);
    expect(screen.getByTestId("test")).toBeInTheDocument();
  });
});
```

### README.md
```markdown
# {Feature Name}

{One sentence: what this feature does}

## Entry point

`{feature-name}.tsx`

## API

Uses `{feature-name}.service.ts` with TanStack Query.
```

5. Update the domain's README.md to list the new feature.

6. Report what was created and suggest next steps.
