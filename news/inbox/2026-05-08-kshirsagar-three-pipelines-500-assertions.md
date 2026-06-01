---
title: "3 Pipelines. 14 Days. 0 → 500 AI Test Assertions: Building LLM QA Automation from Scratch"
author: Rohit Kshirsagar
date: 2026-05-08
url: https://medium.com/@krohit0389/3-pipelines-14-days-0-500-ai-test-assertions-building-llm-qa-automation-from-scratch-9853f219663a
status: ✅ destilado
relevance: ⭐⭐⭐⭐⭐
---

# TL;DR

Arquitectura de **3 pipelines secuenciados** que llevó un feature LLM de cero a 500 asserts en CI en 14 días. El unlock conceptual: **dejar de asertar sobre contenido y empezar a asertar sobre propiedades**.

## Tesis central

> Los outputs de LLM son no-deterministas en su frasing exacto. **No son no-deterministas en sus propiedades.** Una respuesta bien grounded en su contexto lo está siempre que se use un buen prompt. Una respuesta que deriva de una baseline validada es detectable como drift aunque el wording difiera.

## Arquitectura (3 capas, cada una entregable de forma independiente)

| # | Pipeline | Qué asserta | Tooling | Días | Assertions |
|---|---|---|---|---|---|
| 1 | **Structural** | output != null, longitud, JSON válido, ausencia de refusal phrases, presencia de entidad de la query | pytest + fixtures | 1-4 | 180 |
| 2 | **Semantic** | answer relevancy, faithfulness (anti-hallucination RAG), contextual recall, coherencia | DeepEval (judge model) | 5-10 | 200 |
| 3 | **Regression** | similitud semántica vs. baseline aprobada (threshold 0.78) | Custom + JSON baseline versionado en repo | 11-14 | 120 |

**Total CI added:** 18min en jobs paralelos + 4min en structural secuencial.

## Patrones / técnicas reusables

1. **Sequenced layered investment.** Cada pipeline entrega valor solo; no hay big-bang. CI signal en día 3, no día 14.
2. **Structural assertions infravaloradas.** "Presencia de entidad de la query en la respuesta" = proxy de relevance sin modelo semántico.
3. **Baseline regression con commit history como audit trail.** Update de baseline = 1 comando CLI; el diff del JSON es la historia de cambios intencionales de comportamiento.
4. **Severity matches block-severity.** Semantic pipeline (depende de judge model externo) → genera warning, no bloquea merge. Structural + regression bloquean.
5. **Circuit breaker** para dependencias externas (judge model provider down).

## Limitaciones admitidas

- 500 assertions ≠ 500 scenarios. Son 120 unique queries × 3 layers (= mismas queries evaluadas en distintos ejes).
- Threshold 0.78 requirió **2 días de tuning** contra histórico — calibración no opcional, y cambiará con cada migración de modelo.
- Construir el dataset de 120 queries con expected outputs bien definidos = **3 días de trabajo focused**. No shortcut-able.

## Qué destilamos a `research/`

→ Añadidos a `insights.md`:
- **Properties-over-content** como unlock conceptual.
- **Sequenced layered architecture** como criterio de roadmap (no big-bang).
- **Severity matches block-severity** como principio de CI design.

→ Añadido a `patterns.md`:
- "Descomposición en 3 capas/agentes" como meta-patrón (este post + 3-agents XPath + RAG test automation).
