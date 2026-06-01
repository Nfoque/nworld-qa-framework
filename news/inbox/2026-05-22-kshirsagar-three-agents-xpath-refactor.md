---
title: "3 Agents. 12 Days. Legacy XPath → Smart Locators"
author: Rohit Kshirsagar
date: 2026-05-22
url: https://medium.com/@krohit0389/3-agents-12-days-77a7827d6b52
status: ✅ destilado
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

Sistema de **3 agentes especializados** que limpió 847 selectores XPath frágiles en 94 archivos de tests Selenium en 12 días, **con 0 regresiones**. Lo importante no es el resultado — es la arquitectura de **confidence-based routing** que decide qué pasa por humano y qué no.

## El problema (psicología, no técnica)

XPath debt compone porque modificar locators tiene riesgo desconocido (no sabes qué más depende del mismo elemento) → nadie los toca → la deuda crece → el miedo crece → la suite se vuelve intocable.

El sistema **no resuelve los selectores**. Resuelve el problema psicológico: hace que el riesgo de refactorizar sea menor que el de no hacerlo.

## Arquitectura: 3 agentes especializados

### Agent 1 — The Archaeologist (audit)

Static analysis pass. Clasifica cada `By.*` locator en 4 tiers de riesgo:

| Tier | Criterio | Acción |
|---|---|---|
| 🔴 Critical | Positional XPath (`//div[3]/span[1]`), auto-generated framework IDs (`ember-*`, `ng-*`) | Fix inmediato |
| 🟠 High | CSS class chains > 2, `@class` XPath, índices hardcoded | Fix this sprint |
| 🟡 Medium | XPath `text()` / `contains()` contra texto estable | Schedule next sprint |
| 🟢 Safe | `By.id()` estable, `By.name()`, `By.linkText()` | No tocar |

Output: JSON backlog con file/line, current selector, tier, test criticality, fix complexity.

> "Transforma 'tenemos 847 XPath que arreglar' en '312 Critical+High, aquí los 47 en flows de mayor valor, en este orden'."

### Agent 2 — The Refactor Engine (replace)

Para cada locator High/Critical:
1. Headless browser probe contra staging → captura DOM subtree.
2. Manda a Claude Sonnet con prompt estructurado y **priority list** explícita:
   ```
   1. By.id()           si existe id estable
   2. By.cssSelector([data-testid='...'])
   3. By.name()
   4. By.cssSelector([aria-label='...'])
   5. By.linkText()
   6. By.xpath()        solo si no hay alternativa estable
   ```
3. Devuelve recommended locator + **confidence score 0-100** + rationale.

**Routing por confidence (el patrón clave):**

| Confidence | Acción | % en su run |
|---|---|---|
| ≥ 85% | Auto-reemplazo, change logged, queued a Validator | 68% |
| 60-84% | Engineer review (one-click approve / override) | 24% |
| < 60% | Manual con context notes (frecuentemente: "frontend debe añadir `data-testid`") | 8% |

### Agent 3 — The Validator (safety net)

Corre **ambas versiones** (original + refactored) contra el mismo staging environment. Cualquier test que cambia pass/fail dispara diff report con DOM state + confidence score asignado.

En 12 días, atrapó **4 casos** donde el reemplazo high-confidence era técnicamente válido pero **conductualmente erróneo** (selector correcto del tipo de elemento, instancia equivocada).

> "Cero regresiones shipeadas. No porque los agentes fueran perfectos. Porque la capa de validación atrapó imperfección antes de llegar a main."

## Patrones / técnicas reusables

1. **Confidence-based human-in-the-loop routing.** El agente etiqueta su propia incertidumbre; humanos revisan solo el rango ambiguo.
2. **Validation by parallel execution.** Correr original y refactored en paralelo es el único garante real de "zero regression".
3. **Priority list explícita en el prompt** (no "find best locator", sino lista numerada). El modelo no inventa estrategia; ejecuta política.
4. **Static analysis + LLM en pipeline.** El Archaeologist no usa LLM (clasificación determinista); el LLM solo entra cuando hay ambigüedad real.

## Limitaciones admitidas

- 8% manual requirió cambios cross-team en frontend (añadir `data-testid` a 23 componentes) — 3 días de scheduling + 4h de implementación.
- Validator dobla el CI runtime durante la ventana de refactor (~35min adicionales por run en 94 files).
- Calibración del confidence está atada a Selenium standard API; Shadow DOM / Web Components → scores sistemáticamente menores y más manual.

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **Confidence-based routing** como patrón táctico clave.
- **Static analysis + LLM fallback** (no LLM-everywhere): determinismo donde se puede, LLM donde hay ambigüedad.
- **Validation by parallel execution** como el único garante real.

→ Refuerza pattern en `patterns.md`:
- "Descomposición en 3 capas/agentes" — segundo dato point (junto a 3-pipelines del mismo autor).
