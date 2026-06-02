# News — QA Automation + LLMs

Colección de noticias, artículos, posts, papers y publicaciones relacionadas con
automatización de testing usando LLMs.

## Fuentes RSS

Las fuentes RSS verificadas viven en [`feeds.md`](feeds.md). Los Top 3 son los
tag feeds de Medium (`ai-testing`, `llm-testing`, `test-automation`).

## Artículos de pago (Medium member-only)

Yo no puedo entrar a tu cuenta de Medium. El RSS sólo da excerpts. Para que pueda
leer el cuerpo completo, ver [`paywall-workflow.md`](paywall-workflow.md) — el
flujo recomendado es **MarkDownload + drop en `inbox/raw/`**.

## Cómo añadir una noticia

1. Guardar el artículo (o un resumen + link) en `inbox/` con nombre `YYYY-MM-DD-slug.md`.
2. Añadir una entrada en la tabla de abajo.
3. Cuando se haya destilado a `research/`, marcar como ✅ procesada.

## Índice

| Fecha | Título | Fuente | Estado | Notas |
|---|---|---|---|---|
| 2026-06-01 | [Test-Driven AI: Deterministic CI/CD Evaluations for Genkit in Go](inbox/2026-06-01-elamir-genkit-go-deterministic-evals.md) | Medium (ElAmir Mansour) | ✅ destilado | "Score, don't assert" + eval-as-merge-gate en GitHub Actions. Refuerza, no abre eje. |
| 2026-06-01 | [How I Built a pytest Framework to Test LLMs on Red Hat OpenShift AI](inbox/2026-06-01-pattnaik-pytest-llm-openshift.md) | Medium (alaka_pattnaik) | ✅ destilado | **Negative-retrieval (fake-fact injection)** + Layer 0 de serving + judge model custom (gotcha DeepEval↔OpenAI). |
| 2026-06-01 | [Using AI to Find Coverage Gaps in Your Playwright Test Suite](inbox/2026-06-01-amrutalohabare-ai-coverage-gaps-playwright.md) | Medium (Amrutalohabare) | ✅ destilado | Patrón "coverage gap analysis como PR linter" + GitHub Action concreto. |
| 2026-05-30 | [How RAG is Transforming Test Automation](inbox/2026-05-30-singh-rag-test-automation.md) | Medium (Sanjay Singh) | ✅ destilado | Mapa conceptual: RAG para failure analysis + classification taxonomy + duplicate detection. |
| 2026-05-25 | [Why QA Engineers Should Learn Playwright MCP](inbox/2026-05-25-sanaev-playwright-mcp.md) | Medium (Muhammad Sanaev) | ✅ destilado | Aclara "MCP = build-time inspector, no run-time runner". Refuerza separación regression/exploratory. |
| 2026-05-22 | [3 Agents. 12 Days. Legacy XPath → Smart Locators](inbox/2026-05-22-kshirsagar-three-agents-xpath-refactor.md) | Medium (Rohit Kshirsagar) | ✅ destilado | Arquitectura 3 agentes (Archaeologist/Refactor/Validator) + confidence-based routing. |
| 2026-05-08 | [3 Pipelines. 14 Days. 0 → 500 AI Test Assertions](inbox/2026-05-08-kshirsagar-three-pipelines-500-assertions.md) | Medium (Rohit Kshirsagar) | ✅ destilado | **Unlock conceptual: properties over content.** Arquitectura 3 capas: structural/semantic/regression. |
| 2026-05-05 | [4 Metrics. 1 Week. PromptFoo Setup for SDETs](inbox/2026-05-05-kshirsagar-promptfoo-rag-validation.md) | Medium (Rohit Kshirsagar) | ✅ destilado | PromptFoo + 4 métricas. Construcción de ground-truth dataset desde 3 fuentes. |
| 2026-05-03 | [You Don't Have a Testing Problem. You Have a Vibes-Based Deployment Problem](inbox/2026-05-03-garvanand-vibes-based-deployment.md) | Medium (Garvanand) | ✅ destilado | **Trajectory eval ≠ output eval.** 4 axes de medición para agentes. LLM-as-Judge failure modes. |
| 2026-05-03 | [Your AI Test Pipeline Does Not Need the Cloud](inbox/2026-05-03-kshirsagar-local-llm-pipeline.md) | Medium (Rohit Kshirsagar) | ✅ destilado | Local-first con Ollama + LM Studio. OpenAI-compatible API como capa de portabilidad. |
| 2026-02-23 | [I replaced my entire QA team with Claude and Agentic Workflow](inbox/2026-02-23-kastner-replaced-qa-team-with-claude.md) | Medium · Level Up Coding (Brent Kastner) | ✅ destilado | Postmortem del autor de `references/ai-qa-framework/`. Tesis regression-vs-exploratory. |
| 2022-01-01 | [Testing Automation, What are Pyramids and Diamonds?](inbox/2022-01-01-kapoor-pyramids-diamonds.md) | Medium (Ritesh Kapoor) | ✅ destilado | Ancla conceptual no-LLM: pirámide/invertida/diamante. Base que el "AI Testing Pyramid rewritten" da por reescrita. |

**Leyenda de estado:** 🔲 nuevo · 🔍 en estudio · ✅ destilado a `research/` · ❌ descartado

## Temas que rastreamos

- Agentes LLM para generación de tests (unit, integration, E2E)
- Frameworks de evaluación de outputs de LLMs (LLM-as-a-judge, golden sets)
- Test generation desde specs / requirements
- Self-healing tests
- Visual regression con vision models
- Tool use / MCP servers para QA
- Casos de uso en empresas (post-mortems, blog posts de ingeniería)
