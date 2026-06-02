---
title: "How I Built a pytest Framework to Test LLMs on Red Hat OpenShift AI"
author: alaka_pattnaik
date: 2026-06-01
url: https://medium.com/@alakap2026/title-how-i-built-a-pytest-framework-to-test-llms-on-red-hat-openshift-ai-and-what-i-learned-c94315f72fad
status: ✅ destilado
relevance: ⭐⭐⭐⭐
---

# TL;DR

Caso práctico de un framework open-source (`agenteval-platform`, pytest) con **3 capas de testing de AI**: (1) API de model serving, (2) calidad de output LLM vía judge model, (3) pipeline RAG. Mismo modelo de 3 capas que ya vimos en Kshirsagar ([[2026-05-08-kshirsagar-three-pipelines-500-assertions]]), pero aquí la novedad es la **capa de infra (serving)** y un test de RAG brillante: inyectar un hecho falso en el vector store y assertir que el modelo lo usa. Stack 100% open source / coste $0. (Ojo: el artículo es en parte autopromo de búsqueda de empleo.)

## Arquitectura de 3 capas

**Layer 1 — Model Serving API Tests** (la base: fiabilidad antes que calidad)
- Valida: HTTP 200 de los endpoints de inferencia, latencia dentro de SLA, JSON schema válido, edge cases (prompts vacíos, caracteres especiales, inputs largos, requests concurrentes).
- Stack: `pytest + httpx + Ollama (llama3.2 local)`. Corre en <10s.

**Layer 2 — LLM Output Quality Tests** (donde acaba el QA tradicional y empieza el AI QE)
- Judge model = Groq `llama-3.3-70b-versatile` puntúa al modelo local en 3 dimensiones:
  - **Hallucination** — ¿inventó hechos fuera del contexto?
  - **Faithfulness** — ¿se mantuvo dentro de lo recuperado?
  - **Relevancy** — ¿la respuesta es útil para la pregunta?
- **Gotcha clave:** empezó con **DeepEval** pero tiene una **dependencia dura de OpenAI** que no se puede override. La reemplazó por una función judge custom con Groq → control total del rubric + coste cero.

**Layer 3 — RAG Pipeline Tests**
- RAG agent: `LangChain LCEL` + `ChromaDB` + `nomic-embed-text` (embeddings) + `Ollama llama3.2`.
- Tests: ¿el retriever devuelve docs relevantes? ¿la respuesta contiene keywords del contexto recuperado? ¿responde desde retrieval y no desde memoria? ¿dice "I don't know" para preguntas fuera de contexto?
- **El test más ingenioso:** inyectar un hecho falso en el vector store (`"the secret deployment colour is ULTRAVIOLET"`) y assertir que el modelo lo usa. Si lo usa → retrieval funciona. Si da la respuesta real desde memoria de training → **el pipeline RAG está roto.**

## Portabilidad local ↔ producción

- Protocol abstraction layer: los **mismos tests pytest** corren contra Ollama local (dev) y endpoints KServe (prod en OpenShift AI).
- Cambiar de entorno = una línea en `test_config.yaml` (`environment: "local" → "openshift"`).
- Validó contra un cluster real (Red Hat Developer Sandbox): ModelMesh + OpenVINO + modelo ONNX, protocolo KServe V2.

## 5 lecciones de AI QE (las del autor)

1. **Score, don't assert** — `assert score >= threshold`, no `== expected`.
2. **You need a judge model** — humano no escala, reglas pierden matiz, LLM-as-judge es rápido/consistente.
3. **Test the pipeline, not just the model** — el 60% de fallos reales pasan a nivel pipeline (docs mal recuperados, overflow de context window, bugs de prompt template).
4. **Non-determinism is a feature** — mismo código puede pasar o fallar; no es flakiness, es el modelo variando. Trackear **tendencia del score**, no pass/fail individual.
5. **Las skills de QE clásicas importan más** — el AI engineer conoce modelos; el QE conoce failure modes. La intersección es donde está el valor.

## Stack (todo open source, $0)

`pytest + httpx` · `Ollama` (llama3.2) · `Groq` (judge, free tier) · `LangChain` (RAG) · `ChromaDB` · `nomic-embed-text` · `GitHub Actions` · `Allure` (reporting).
Resultados: 36 tests / 4 capas / 100% pass / 2 entornos. Repo: github.com/alakapatnaik/agenteval-platform

## Patrones / técnicas reusables

1. **Negative-retrieval test (fake fact injection)** — la técnica más reusable del artículo: planta un hecho que NO está en training y verifica que sale por retrieval. Distingue "RAG funciona" de "el modelo lo sabía igual". **Nuevo, no estaba en research.**
2. **Capa de serving/infra como Layer 0** — testear 200/latencia/schema *antes* de calidad. Los otros artículos del inbox saltan directo a calidad; esto añade el cimiento.
3. **Protocol abstraction (local↔prod con 1 línea)** — mismo set de tests, dos entornos. Patrón de portabilidad alineado con "local-first" ([[2026-05-03-kshirsagar-local-llm-pipeline]]).
4. **Cuidado con lock-in de OpenAI en tooling de eval** — DeepEval forzaba OpenAI; un judge custom da control de rubric y coste. Gotcha práctico de selección de herramienta.

## Limitaciones

- 100% pass rate + autopromo de empleo → leer con escepticismo; no hay casos donde el framework encontró un bug real en producción.
- "Trackear tendencia del score" se enuncia pero no se implementa (no hay baseline/histórico en el repo descrito).
- El judge (Groq free tier) introduce dependencia externa que contradice parcialmente el "todo local".

## Qué destilamos a `research/`

→ Eje nuevo + refuerzos:
- **Negative-retrieval / fake-fact injection** como técnica de validación de RAG → añadir a `patterns.md`.
- **Layer 0 de serving** (200/latencia/schema antes de calidad) → completa el modelo de 3 capas hacia 4.
- Refuerza **judge model** y **score-don't-assert** (convergencia con elamir y Kshirsagar).
