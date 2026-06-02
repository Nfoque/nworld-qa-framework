---
title: "Test-Driven AI: Building Deterministic CI/CD Evaluations for Genkit in Go"
author: ElAmir Mansour
date: 2026-06-01
url: https://elamir.medium.com/test-driven-ai-building-deterministic-ci-cd-evaluations-for-genkit-in-go-f4d26f457e5f
status: ✅ destilado
relevance: ⭐⭐⭐
---

# TL;DR

Cómo meter evals de LLM **deterministas-en-resultado** dentro del loop de CI/CD usando Google Genkit + Go. La tesis: pasar de lógica booleana (`output == expected`) a **evaluación continua por umbral** (`score >= threshold`), con golden datasets como holdout y LLM-as-Judge puntuando contra un rubric. Conceptualmente sólido, pero el artículo es corto (3 min) y los snippets de Go están vacíos — es más manifiesto que tutorial.

> ⚠️ Los bloques de código `Go` del crudo vienen sin cuerpo (`func TestCodeGenerationAgent(t *testing.T) {}`). El valor está en el modelo mental, no en código copiable.

## Idea central — del realm determinista al probabilístico

- El SWE vive en lo determinista: una línea de código → un output esperado → un unit test que lo prueba.
- Los LLMs rompen el pipeline: cambiar un system prompt o que el provider suelte nueva versión del modelo desplaza el comportamiento del agente de forma sutil y peligrosa.
- Exact string matching → tests frágiles e inútiles. La meta es **threshold-based continuous evaluation**.

## El framing SWE vs ML (cita a *Building ML Powered Applications*, Ameisen)

- `software testing` chequea **lógica**.
- `ML validation` evalúa **comportamiento contra una distribución** de outcomes esperados.
- Puente entre ambos = 3 componentes:
  1. **Proxy metrics** para cuantificar calidad.
  2. **Golden datasets** como holdout sets.
  3. **Continuous evaluation automatizada** dentro del CI/CD.

## Genkit + LLM-as-Judge

- Genkit (Google) da un modo robusto de construir y **tracear** flows de AI.
- En vez de comparar contra string exacto, un LLM secundario actúa de **juez** y puntúa al agente primario contra un rubric: `factual accuracy`, `toxicity`, `schema compliance`.

## CI/CD gate concreto

- Golden dataset en JSON (`input` / `context` / `expected_output`).
- Lógica de eval en Go corre los casos.
- Integrado en **GitHub Actions**: si `meanAccuracy` cae bajo el umbral, el runner lo interpreta como job failure y **bloquea el merge**.

## Patrones / técnicas reusables

1. **Score, don't assert** — el mismo unlock que ya aparece en otros artículos del inbox (Kshirsagar, Pattnaik). Convergencia fuerte del ecosistema.
2. **Golden dataset como holdout set** — vocabulario ML aplicado a QA, no sólo "casos de prueba".
3. **Eval como merge gate** — misma familia que "coverage gap como PR linter" ([[2026-06-01-amrutalohabare]]). El gate vive en GitHub Actions y bloquea por umbral, no por keyword.

## Limitaciones (no admitidas)

- El threshold gate sufre el mismo problema que toda eval no-determinista: el score varía run-a-run, así que un umbral fijo genera flakiness en el propio gate. No menciona tracking de tendencia ni reintentos.
- Genkit + Go es un stack de nicho; el patrón es portable pero el artículo no lo aísla del framework.
- Cero detalle sobre cómo se construye/versiona el golden dataset (el trabajo real).

## Qué destilamos a `research/`

→ Refuerza patrones ya registrados (no abre eje nuevo):
- **"Score, don't assert"** ahora visto en 3+ fuentes independientes → promover a patrón consolidado.
- **Eval-as-merge-gate** como variante de "QA gate en CI" — anotar el matiz del umbral flaky.
