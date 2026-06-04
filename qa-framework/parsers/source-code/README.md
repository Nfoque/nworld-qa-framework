# Parser: Source Code

> Origin: internal pilot — `create-e2e-spec` skill

## What it does

Given the path to a component or feature, it extracts relevant context for generating E2E tests:

1. **testIds** — all `data-testid` attributes in the component
2. **Interactions** — buttons, links, forms, selects, inputs
3. **Routes** — which URL the component maps to (from the router)
4. **API calls** — which endpoints it calls (from the service/hook)

## Input

- Path to the component or feature directory
- Optionally: path to the router to resolve the URL

## Output (context for the prompt)

```
Component: list-products.tsx
Route: /catalog/list-products

testIds found:
- product-table
- product-filters
- product-row
- loading-spinner

Interactive elements:
- combobox "Status" (selectOption)
- button "Search" (click)
- link "View detail" per product-row (click → navigates)

API calls:
- useProductList(filters) → GET /api/v1/products
```

## Output schema

```typescript
interface SourceCodeContext {
  component: string;
  route: string | null;
  testIds: string[];
  interactions: {
    element: string;
    type: 'button' | 'link' | 'input' | 'select' | 'combobox';
    action: string;
    testId: string | null;
  }[];
  apiCalls: {
    hook: string;
    method: string;
    endpoint: string;
  }[];
}
```

## Existing base

- The `create-e2e-spec` skill from the pilot already reads the component to infer testIds and interactions

What's missing:
- Systematic extraction of testIds (today the skill asks the LLM to "read and understand")
- Route resolution from the router
- Formatting as structured context (today it's ad-hoc in the skill's prompt)
