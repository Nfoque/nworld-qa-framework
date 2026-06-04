# Parser: OpenAPI

> Origin: internal pilot — ADR 10 (OpenAPI-driven development)

## What it does

Given an OpenAPI spec (YAML/JSON) and a feature name, it extracts context for the E2E test
generation prompt:

1. **Relevant endpoints** — the ones the feature uses (matching by path patterns)
2. **Response schemas** — structure of what the backend returns
3. **Request schemas** — parameters, body, query params
4. **Error responses** — 4xx/5xx defined in the spec (for generating error tests)

## Input

- OpenAPI spec: local path to YAML/JSON or URL
- Feature name: to filter relevant endpoints (e.g.: `list-products` → `/api/v1/products`)

## Output (context for the prompt)

```
Relevant endpoints for list-products:
- GET /api/v1/products → ProductResponse[] (200), ErrorResponse (400, 500)
- GET /api/v1/products/{id} → ProductDetailResponse (200), NotFoundResponse (404)

Response schema (ProductResponse):
- productId: string
- productDescription: string
- active: boolean
- samples: SampleResponse[]
- lastModificationDate: string (date-time)

Defined error responses:
- 400: { code: string, message: string }
- 404: { code: string, message: string }
- 500: { code: string, message: string }
```

## Output schema

```typescript
interface OpenAPIContext {
  endpoints: {
    method: string;
    path: string;
    operationId: string | null;
    responseSchema: Record<string, unknown> | null;
    requestSchema: Record<string, unknown> | null;
    queryParams: string[];
    pathParams: string[];
  }[];
  errorResponses: {
    endpoint: string;
    statusCode: number;
    schema: Record<string, unknown>;
  }[];
  reusableSchemas: {
    name: string;
    properties: Record<string, string>;
  }[];
}
```

## Existing base

From the internal pilot:
- `generate-fixtures.js` which parses the spec with `@apidevtools/swagger-parser`

What's missing:
- Endpoint filtering by feature (today all endpoints are processed)
- Formatting as context for the prompt (today it generates fixtures, not textual context)
- Error response extraction (today it only looks at 200)
