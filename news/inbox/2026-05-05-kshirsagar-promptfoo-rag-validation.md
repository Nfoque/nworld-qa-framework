---
title: "4 Metrics. 1 Week. Blind Testing → Full RAG Validation: PromptFoo Setup for SDETs"
author: Rohit Kshirsagar
date: 2026-05-05
url: https://medium.com/@krohit0389/4-metrics-1-week-blind-testing-full-rag-validation-promptfoo-setup-for-sdets-f87b8211eb8a
status: ✅ destilado
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

Setup de **PromptFoo** en una semana con 4 métricas que destapó **14 prompts variantes que el manual review había aprobado**. El framework es YAML-first + Git-native + CI-native.

## Tesis central

> El tipo de confianza más peligroso no es la incertidumbre — es la confianza tras una sesión de manual testing que "fue bien". Para LLMs eso es liability, no validación. Los LLMs no fallan tirando excepciones: fallan siendo confidentemente incorrectos, sutilmente off-topic, inconsistentes entre inputs equivalentes, o tóxicos en edge cases.

## Por qué PromptFoo (vs. DeepEval / RAGAS)

| Criterio | PromptFoo | DeepEval |
|---|---|---|
| Config | YAML en Git, revisable en PR | Python-native, más flexible |
| Comparación side-by-side de prompts | Nativa | Vía custom code |
| CI integration | 4 líneas en GitHub Actions | Más setup |
| Métricas RAG-específicas (precision/recall del retrieval) | Limitadas | Más completas |

**Combinable:** PromptFoo (CI rápido + variant comparison) + DeepEval/RAGAS (deep retrieval analysis). No son mutuamente excluyentes.

## Las 4 métricas (elegidas por cubrir failure modes reales)

| Métrica | Threshold | Qué cubre |
|---|---|---|
| **Answer correctness** | 0.85 | similitud semántica vs. expected output |
| **Context adherence** | 0.80 | hallucination detector para RAG: cada claim debe ser grounded en context retrieved |
| **Toxicity** | pass/fail | adversarial prompts, alto downside asimétrico |
| **Response consistency** | 0.80 | dos rephrasings de la misma pregunta producen respuestas equivalentes |

## Ground-truth dataset — 3 fuentes (2 días de trabajo)

1. **Production query logs** (90 queries) — categorizadas por intent, sampleadas representativamente.
2. **Adversarial prompts** — known failure modes, queries fuera de scope, ambigüedades.
3. **Regression cases** — bugs que llegaron a prod en el último cuarto.

Expected output ≠ string exacto. Criterios: "must acknowledge X", "must not claim Y", "must cite source Z".

## Hallazgo crítico de la primera corrida

| Métrica | Production prompt | Revised prompt (con grounding instructions explícitas) |
|---|---|---|
| Context adherence | 0.73 ❌ | **0.89** ✅ (+16 puntos) |

→ Data driveada decisión que de otro modo habría sido debate subjetivo product vs. eng.

## Patrones / técnicas reusables

1. **Eval al pipeline completo, no al modelo en aislamiento.** PromptFoo apunta al endpoint del RAG pipeline, no al modelo directamente.
2. **Variant comparison head-to-head como mecanismo de decisión.** Tres variantes del system prompt corridas en una sola pasada.
3. **Threshold per métrica, no global.** Cada axis tiene su propio umbral porque cada uno tiene su distribución natural.

## Limitaciones admitidas

- 120 cases ≠ cobertura del long tail. Dataset es living document, hay que rebaselinear con cada cambio significativo de modelo/retrieval.
- Semantic similarity es sensible a la calidad de los expected outputs. Garbage in → garbage out aplica al eval tanto como al modelo.

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **PromptFoo + DeepEval/RAGAS** como stack combinable (no excluyente).
- **Eval the pipeline, not the model.** Test endpoint del sistema completo.
- **Per-metric thresholds, no global.** Cada axis tiene su distribución.
- **Variant comparison as decision mechanism.** Convierte debates subjetivos en data.

→ Refuerza pattern en `patterns.md`:
- "Golden dataset / ground truth" como inversión obligatoria, no shortcut-able.
