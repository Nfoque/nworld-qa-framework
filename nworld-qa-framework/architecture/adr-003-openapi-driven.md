# ADR-003: OpenAPI spec as input for test generation

> Status: **accepted**
> Date: 2026-06-02
> Origin: internal pilot — ADR 10 (OpenAPI-driven development)

## Context

When a project has an OpenAPI spec (from the backend, BFF, or API gateway), that spec
contains valuable information for generating E2E tests: available endpoints, request/response
schemas, and defined error states.

## Decision

The framework uses the OpenAPI spec as an **optional input** of the generation pipeline.
The OpenAPI parser extracts relevant context and injects it into the prompt so the LLM
generates more precise tests.

## What the parser extracts (for the generation prompt)

```
OpenAPI Spec (local path or URL)
  │
  └─ OpenAPI Parser (framework) → context for generation:
      - Endpoints relevant to the feature under test
      - Response schemas (what structure the backend returns)
      - Request schemas (parameters, body, query params)
      - Defined error responses (4xx, 5xx → error tests)
```

## Example of generated context

```
Relevant endpoints for list-products:
- GET /api/v1/products → ProductResponse[] (200), ErrorResponse (400, 500)
- GET /api/v1/products/{id} → ProductDetailResponse (200), NotFoundResponse (404)

Response schema (ProductResponse):
- productId: string
- productDescription: string
- active: boolean

Defined error responses:
- 400: { code: string, message: string }
- 404: { code: string, message: string }
```

## How it feeds test generation

With this context, the LLM can generate:

1. **Data tests** — assertions on response structure (fields, types)
2. **Error tests** — `page.route()` simulating each error defined in the spec
3. **Filtering/pagination tests** — if the spec defines query params
4. **Mock fixtures** — realistic data based on the schemas

Without OpenAPI, the LLM only has the frontend component and must infer data shapes.
With OpenAPI, it generates more complete tests and more realistic fixtures.

## Implication for the framework

The OpenAPI parser (`parsers/openapi/`) must:
1. Read the YAML/JSON spec from a local path or URL
2. Extract endpoints relevant to a given feature
3. Extract request and response schemas
4. Format as textual context for the generation prompt

Its role is to **extract context for the LLM**, not to generate code or types.

## Origin

- Full pattern: internal pilot — ADR 10 (OpenAPI-driven development)
- Reference spec: enterprise spec with 91 endpoints and 255+ schemas
