# Verify

Run the full verification pipeline: lint, type-check, unit tests, and architectural validation.

## Input

$ARGUMENTS = `quick` or `full` (default: `quick`)

- **quick** — lint + type-check + unit tests
- **full** — quick + E2E tests + architectural validation

## Instructions

### Quick verification

1. Run linting:
   ```bash
   cd code && pnpm lint
   ```
   Report any issues found. If there are auto-fixable issues, ask the user if they want to run `pnpm lint:fix`.

2. Run type checking:
   ```bash
   pnpm types:check
   ```
   Report any TypeScript errors with file paths and line numbers.

3. Run unit tests:
   ```bash
   pnpm test
   ```
   Report test results: total, passed, failed, coverage summary.

4. Summarize results:
   ```
   Verify (quick):
   ✓ Lint: {X} issues (or "clean")
   ✓ Types: {X} errors (or "clean")
   ✓ Tests: {passed}/{total} passed, {coverage}% coverage
   ```

### Full verification (extends quick)

5. Run E2E tests against mock server (see `architecture/adr-002-playwright-setup.md`):
   ```bash
   pnpm test:e2e
   ```
   Report results per spec file.

6. Run architectural validation — check for structural rule violations:

   a. **No cross-feature imports**: Search for imports between feature folders
   ```bash
   grep -r "from.*features/.*/" src/domains/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."
   ```
   Flag any import that crosses feature boundaries.

   b. **No cross-domain imports**: Search for imports between domain folders
   ```bash
   for domain in src/domains/*/; do
     domain_name=$(basename "$domain")
     grep -r "from.*domains/" "$domain" --include="*.ts" --include="*.tsx" | grep -v "domains/$domain_name" | head -5
   done
   ```

   c. **Feature naming**: Verify all features use kebab-case and files are prefixed with the feature name
   ```bash
   find src/domains -type d -path "*/features/*" -maxdepth 4 | while read dir; do
     feature=$(basename "$dir")
     ls "$dir" | grep -v "^${feature}" | grep -v "README" | grep -v "^mf-"
   done
   ```

   d. **Required files**: Check that each feature has at minimum a `.tsx` entry point and a `.test.tsx`
   ```bash
   find src/domains -type d -path "*/features/*" -maxdepth 4 | while read dir; do
     feature=$(basename "$dir")
     [ ! -f "$dir/${feature}.tsx" ] && echo "MISSING: $dir/${feature}.tsx"
     [ ! -f "$dir/${feature}.test.tsx" ] && echo "MISSING: $dir/${feature}.test.tsx"
   done
   ```

7. Summarize full results:
   ```
   Verify (full):
   ✓ Lint: clean
   ✓ Types: clean
   ✓ Tests: 24/24 passed, 85% coverage
   ✓ E2E: 6/6 passed (mock environment)
   ✓ Architecture:
     - Cross-feature imports: 0 violations
     - Cross-domain imports: 0 violations
     - Naming conventions: all compliant
     - Required files: all present
   ```

If any step fails, stop and report the issue with enough context to fix it. Do not continue to the next step on failure.
