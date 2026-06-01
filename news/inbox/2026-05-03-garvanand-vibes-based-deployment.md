---
title: "You Don't Have a Testing Problem. You Have a Vibes-Based Deployment Problem"
author: Garvanand
date: 2026-05-03
url: https://medium.com/@garvanand03/you-dont-have-a-testing-problem-you-have-a-vibes-based-deployment-problem-2f020b096057
status: ✅ destilado
relevance: ⭐⭐⭐⭐⭐ (pieza más conceptualmente importante del batch — define qué evaluar en sistemas agénticos)
---

# TL;DR

Define la distinción **output evaluation vs. trajectory evaluation** — la razón por la que herramientas tradicionales de eval de LLM **no sirven para agentes**. Propone 4 axes de medición, código copiable de un evaluator mínimo, y los failure modes específicos del LLM-as-Judge.

## Tesis central

> Los frameworks estándar de eval de LLM evalúan **outputs**, no **trayectorias**. Miden lo que el modelo dijo en step 3, no si el output de step 3 causó que step 7 fallara.
>
> Un eval single-call responde: *is this response good?*
> Un eval de agente tiene que responder: *did the agent pursue the right strategy, use the right tools, reason correctly at each step, and arrive at a useful outcome — across an entire multi-turn session?*

**Implicación:** un fallo en agentic systems ocurre típicamente **mid-execution**, no en el output final. Un wrong-tool en step 2 puede producir un final response que parece plausible. Output-only eval nunca lo atrapará.

## Los 4 axes que hay que medir

| # | Axis | Qué cubre | Ejemplo de métrica |
|---|---|---|---|
| 1 | **Output quality** | respuesta final correcta, grounded, formato OK | correctness, faithfulness, coherence |
| 2 | **Tool selection accuracy** | ¿el agente eligió la tool correcta? | comparación contra reference trajectory |
| 3 | **Step-level faithfulness** | cada paso intermedio es razonable | sampling representativo evaluado sistemáticamente |
| 4 | **Regression across changes** | tras cambio de prompt/retrieval/modelo, ¿los core cases siguen pasando? | golden dataset run pre/post |

## El evaluator mínimo (golden cases + checks deterministas)

Estructura del golden case:
```python
{
    "id": "tool_use_01",
    "input": "Search the database for Q3 revenue figures",
    "expected_tools": ["database_query"],
    "expected_behavior": "Queries database, not web search",
    "should_not_contain": ["I'm not sure", "I don't know"]
}
```

**Checks deterministas (gratis y suficientes para mucho):**
- forbidden phrases (`should_not_contain`)
- tool usage match (`expected_tools` vs `result["tool_calls"]`)
- format compliance

→ "Una golden dataset + script de comparación pre/post = **una tarde** de setup. Suficiente para catch la mayoría de regresiones."

## LLM-as-Judge: failure modes específicos

| Bias / pitfall | Mitigación |
|---|---|
| **Verbosity bias** — judges premian respuestas largas | prompt explícito a evaluar concisión |
| **Self-serving bias** — usar misma model family como judge inflactaba scores | usar judge de otra family |
| **Vague rubrics** ("is this good?") producen scores inútiles | criterios observables específicos, con anchors por nivel |
| **Missing ground truth** | dar al judge la respuesta correcta para comparar, no scoring open-ended |

> "LLM-as-Judge es una herramienta, no ground truth. Validarla contra ratings humanos sobre un sample antes de scalear."

## Patrones / técnicas reusables

1. **Trajectory eval como categoría distinta.** Los frameworks de output eval NO sirven para agentes. Asunción default a evitar.
2. **Reference trajectory por test case.** Define "qué tools y en qué orden esperarías ver" → compara contra eso. No es output match, es path match.
3. **Deterministic evals son gratis y catchean mucho.** No empieces con LLM-as-Judge — empieza con forbidden phrases + tool usage + format.
4. **Cada production failure es un nuevo golden case.** El dataset crece con la operación; estático es señal de abandono.
5. **Latency y coste son ejes de eval.** Una respuesta 30% más accurate pero 4× más lenta y 3× más cara NO es mejora para muchos productos.

## Mitos que desmonta

- "Mis 5 ejemplos manuales son mi test suite" → 5 ejemplos no es suite, es ritual de comodidad.
- "Evals son para escala, no early stage" → 15min de eval en día 1 ahorran días de debug en prod.
- "Si benchmark sube, mi agente mejora" → overfit al golden dataset es real. Hay que ir añadiendo failures de prod.
- "Accuracy es suficiente" → para clasificación sí; para agentes necesitas trajectory metrics.

## Stack 2026 (referencias para tooling)

| Use case | Tool |
|---|---|
| Empezando / small team | DIY deterministic + Braintrust o Langfuse |
| LangChain / LangGraph | LangSmith (native) |
| Hallucination foco | Galileo |
| Production observability | Arize o Langfuse con trace logging |

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **Trajectory eval ≠ output eval** — núcleo del diseño de eval para agentes.
- **Reference trajectory** como artefacto de test.
- **Deterministic-first eval strategy** (LLM-as-Judge solo cuando hace falta).
- **LLM-as-Judge failure modes** (verbosity / self-serving / vague rubric / missing GT) como checklist.

→ Añadidos a `patterns.md`:
- "Tooling landscape converging on Langfuse/LangSmith/Arize/Galileo" — mencionado también por Singh y Kshirsagar.
- "Eval suite es living document — cada prod failure ⇒ nuevo golden case" (patrón compartido con Kshirsagar #2).
