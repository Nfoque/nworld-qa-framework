---
title: "Using AI to Find Coverage Gaps in Your Playwright Test Suite"
author: Amrutalohabare
date: 2026-06-01
url: https://medium.com/@amrutalohabare/using-ai-to-find-coverage-gaps-in-your-playwright-test-suite-7b2e590f8ab9
status: ✅ destilado
relevance: ⭐⭐⭐⭐
---

# TL;DR

4 workflows con prompts copiables para usar Claude como auditor de cobertura sobre una suite Playwright. El workflow #4 es el más valioso: **automatizar el chequeo de gaps en cada PR vía GitHub Actions + Claude API**.

> ⚠️ El raw markdown del artículo está incompleto en `processed/` — falta el inicio. Lo que aparece corresponde a los workflows 1, 3 y 4 (el 2 también falta). Procesado con lo disponible.

## Workflow 1 — Find missing scenarios from user story

Prompt template:
```
You are a senior QA engineer reviewing test coverage for a Playwright Python test suite.

User story: [paste]
Acceptance criteria: [paste]
Existing tests: [paste]

Review the tests against acceptance criteria and:
1. List scenarios from AC NOT covered
2. List edge cases and boundary conditions not covered
3. Rate overall coverage as Low/Medium/High with reason
```

**Caso real reportado:** corrió esto sobre tests de checkout. AC tenía 8 puntos, tests cubrían 6. Claude detectó en <10s:
- ❌ No test para applying expired discount code
- ❌ No test para checkout cuando saved card está expirada

## Workflow 3 — Traceability sin herramienta dedicada

Mapea user stories → test functions automáticamente. Output ejemplo:
```
US-04 (Remember me functionality) → ❌ NO TEST FOUND
US-05 (Password reset flow) → ❌ NO TEST FOUND
```

Es una matriz de trazabilidad ligera que típicamente requiere herramienta (Xray, Zephyr) o spreadsheet manual.

## Workflow 4 — Automate en cada PR (el power move)

GitHub Action que en cada PR a `tests/**` corre un script Python que:
1. Lee todos los test files de `tests/`.
2. Manda el conjunto a Claude Sonnet 4 (`claude-sonnet-4-20250514`).
3. Pide gaps HIGH risk, máximo 5.
4. **Falla el build si la respuesta contiene "high"**.

Workflow YAML + script Python completos están en el artículo (ver crudo en `processed/`).

## Patrones / técnicas reusables

1. **Coverage gap analysis como linter en PR.** Mismo modelo mental que ESLint/typecheck — corre automático, bloquea merge si flag.
2. **Constrain output** ("maximum 5 items", "be concise", "format as bullet list") — reduce noise y coste de tokens.
3. **Gate por keyword en respuesta** (`if "high" in gaps.lower()`) — simplísimo y suficiente para empezar.

## Limitaciones (no admitidas pero obvias)

- Mandar **todos** los test files en un solo prompt no escala — context window finito + coste creciente.
- Gate por keyword es frágil: el modelo puede decir "no high-risk gaps detected" y bloquear el build. Necesita structured output (JSON con field `risk_level`).
- No hay caching ni baseline — cada PR re-evalúa la suite entera incluso si no cambió la lógica core.

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **Coverage gap analysis como PR linter** — patrón replicable.
- **Output constraints en prompt** (max items, formato) como técnica de control de coste/ruido.
- **Structured output mandatory** para gating decisions (no keyword matching).
