# Create Mock Fixture

Create a JSON fixture for the mock server, optionally derived from the OpenAPI spec.

## Input

$ARGUMENTS = `{METHOD} {path}` (e.g., `GET /api/v1/products` or `POST /api/v1/samples`)

## Instructions

1. Parse the input:
   - Extract HTTP method (GET, POST, PUT, DELETE, PATCH) — normalize to lowercase for the filename
   - Extract the API path

2. Check if the OpenAPI spec is available:
   - Look for `node_modules/@inditex-api/*/openapi-rest.yml`
   - Or check `../specification/` for YAML specs

3. If a spec is found:
   - Find the matching endpoint in the spec
   - Extract the response schema for status 200 (or 201 for POST)
   - Generate a realistic JSON fixture from the schema, using `example` values when available
   - For arrays, generate 3-5 items with varied data

4. If no spec is available:
   - Ask the user for the expected response shape
   - Generate a fixture with sensible defaults

5. Create the fixture file following the mock server's resolution path:

```
mock/fixtures/{path}/{method}.json
```

For example: `GET /api/v1/products` → `mock/fixtures/api/v1/products/get.json`

For parameterized paths: `GET /api/v1/products/:id` → `mock/fixtures/api/v1/products/{id}/get.json`

6. If the fixture directory doesn't exist, create it recursively.

7. Verify the fixture:
   - The fixture path matches the server's resolution chain
   - The JSON is valid
   - Response shape matches the spec (if available)

8. Report what was created and how to test it:
   ```
   curl http://localhost:4000{path}
   ```
