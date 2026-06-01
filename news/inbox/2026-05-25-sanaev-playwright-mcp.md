---
title: "Why QA Engineers Should Learn Playwright MCP"
author: Muhammad Sanaev
date: 2026-05-25
url: https://medium.com/@muhammad.sanaev.qa/why-qa-engineers-should-learn-playwright-mcp-a2058f2225f7
status: ✅ destilado
relevance: ⭐⭐⭐⭐
---

# TL;DR

Post breve y muy claro sobre **una distinción que importa**: Playwright MCP no es el test runner, es el **asistente para inspeccionar la app durante la construcción del test**. Aclara una confusión común sobre dónde encaja MCP en el flujo QA.

## Tesis central (en una frase del autor)

> **Playwright MCP no es el test runner. Es el asistente que te ayuda a inspeccionar la app más rápido.**
>
> - Playwright MCP = build-time inspector (vía Cursor/Claude)
> - Playwright CLI = run-time executor (`npx playwright test`)

## Cómo funciona MCP en el flujo

Cursor expone tools (vía Playwright MCP) que controlan un browser real:
- `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_wait_for`

→ Cursor inspecciona la app mientras tú diseñas el test → genera primera versión → tú la refinas → corres con CLI standard.

## El workflow real que propone (9 pasos)

```
1. Use Playwright MCP to inspect the app
2. Understand the user flow
3. Generate the first Playwright test
4. Run it with Playwright CLI
5. Fix failures
6. Refactor into Page Object Model
7. Add test.step() for readable reports
8. Add GitHub Actions CI
9. Add API tests with Playwright request
```

**El valor no está en (3), está en (5)-(9).** El AI te quita el "staring at app, guessing selectors" del paso 1; el resto sigue siendo trabajo de QA.

## Patrones / técnicas reusables

1. **Build-time vs run-time separation.** El MCP vive en desarrollo (humano + IDE); el test final corre en CI sin MCP. Esa frontera es clave para no acoplar producción a una runtime de inspección.
2. **AI explora, humano arquitecta.** Generación inicial no es producto final; es **scaffolding**. POM + test.step + CI no los hace MCP.
3. **No mistificar MCP.** El sitio web no "usa MCP" — Cursor lo usa. MCP es un protocolo de tooling para el cliente LLM, no una capa nueva del SUT.

## Limitaciones (más bien: scope intencional)

- Post breve (3 min read). No entra en detalle técnico del setup de MCP, ni en specifics de Cursor.
- No mide diferencia de productividad ni reporta métricas.

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **Build-time vs run-time separation** como criterio de arquitectura: las herramientas que asisten al QA durante construcción ≠ las que corren en CI.
- **MCP scope clarification:** no hay nada "MCP" en el sistema bajo test; MCP solo conecta el LLM con herramientas locales.

## Implicación directa para nworld-qa-framework

Si construimos sobre Claude + MCP, **separación dura entre fase de exploración (MCP en local) y fase de regresión (tests deterministas en CI sin MCP)**. Esto coincide con la tesis regression-vs-exploratory de Kastner — un patrón estructural emergente.
