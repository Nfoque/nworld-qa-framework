# Insights destilados

Hallazgos clave extraídos de `news/` y `references/`. Cada entrada cita su origen.

## Formato de entrada

```
### [Título corto del insight]
- **Origen:** `news/...` o `references/...`
- **Qué:** una frase
- **Por qué importa para nworld-qa-framework:** una frase
- **Decisión/acción:** qué hacemos con esto (adoptar, prototipar, descartar)
```

---

## Principios estructurales (cómo concebir el framework)

### Regression vs. Exploratory como criterio de diseño
- **Origen:** Kastner postmortem + Sanaev MCP (build-time vs run-time) — refuerzo cruzado.
- **Qué:** Regression exige determinismo; exploratory es no-determinista. LLMs encajan en el segundo, no en el primero. Sanaev reformula la misma frontera como "build-time inspector vs run-time executor".
- **Por qué importa:** Es la frontera arquitectónica del framework. Lo que cruza esta línea sin cuidado se vuelve flakiness estructural.
- **Decisión/acción:** Adoptar como principio rector. Posicionamiento candidato: "LLM-driven exploration + human-curated regression suite".

### Properties over content (el unlock conceptual)
- **Origen:** Kshirsagar — 3 Pipelines. Reforzado por Kshirsagar PromptFoo (criteria-based expected outputs) y Garvanand (trajectory > output).
- **Qué:** Outputs LLM son no-deterministas en frasing, **no en propiedades**. Asertar sobre propiedades estructurales/semánticas/de regresión hace al sistema testeable.
- **Por qué importa:** Define qué tipo de assertions tienen sentido. Cualquier comparación de string exacta es trampa.
- **Decisión/acción:** Adoptar. Todo assertion del framework debe ser sobre una propiedad declarada explícitamente, no sobre contenido literal.

### Trajectory eval ≠ output eval (para agentes)
- **Origen:** Garvanand.
- **Qué:** Agentes fallan mid-execution. Output-only eval no atrapa wrong-tool en step 2 que produce final response plausible. Hay que evaluar tools elegidas, orden, reasoning intermedio.
- **Por qué importa:** Si `nworld-qa-framework` corre como agente (con tool use), necesita reference trajectories, no solo assertions sobre el output final.
- **Decisión/acción:** Adoptar. Reference trajectory por test case = artefacto de primera clase.

### El eje de la pirámide cambia para LLMs (coste/aislamiento → determinismo)
- **Origen:** Kapoor — *Pyramids and Diamonds* (ancla no-LLM, 2022) leído contra los artículos "AI Testing Pyramid rewritten" de 2026.
- **Qué:** La pirámide/diamante clásica ordena tipos de test por un eje implícito de **coste/velocidad/aislamiento** (unit barato/rápido/aislado ↔ E2E caro/lento/realista). Cuando la capa bajo test es un LLM, ese eje deja de ser el dominante: el coste de ejecución importa menos que el **determinismo del output**. La "forma" se reorganiza por **tipo de propiedad evaluada** (structural → semantic → behavioral), no por tipo de test.
- **Por qué importa:** Evita importar la pirámide clásica acríticamente al framework. La unidad de organización de nuestra suite no es unit/integration/E2E sino capas de propiedad (enlaza con [[patterns#properties-over-content]] y la arquitectura por capas de Kshirsagar).
- **Decisión/acción:** Hipótesis a validar. No adoptar la pirámide clásica como taxonomía; explorar una "pirámide de propiedades" (structural ancha y barata en la base, behavioral estrecha y cara arriba) como modelo mental propio.

### Sequenced layered architecture (no big-bang)
- **Origen:** Kshirsagar — 3 Pipelines.
- **Qué:** Cada capa de assertion (structural → semantic → regression) entrega valor de forma independiente. CI signal en día 3, no día 14.
- **Por qué importa:** El framework debe ser entregable por capas, no como suite monolítica que necesita estar "completa" para empezar a aportar.
- **Decisión/acción:** Adoptar como criterio de roadmap.

---

## Patrones tácticos (qué construir)

### Confidence-based human-in-the-loop routing
- **Origen:** Kshirsagar — 3 Agents XPath. Reforzado por Singh (RCA con confidence + similar defect cite) y Garvanand (LLM-as-Judge con thresholds).
- **Qué:** El agente etiqueta su propia incertidumbre. Confidence ≥85% auto; 60-84% review humano; <60% manual con context notes.
- **Por qué importa:** Define cómo se distribuye el trabajo entre LLM y humano sin tener que decidirlo a priori para cada caso.
- **Decisión/acción:** Adoptar. Cada output del framework que requiera juicio debe llevar confidence + rationale.

### Static analysis + LLM fallback (no LLM-everywhere)
- **Origen:** Kshirsagar — 3 Agents XPath (Archaeologist = static, Refactor Engine = LLM, Validator = static).
- **Qué:** Determinismo donde se puede (clasificación con reglas, validación por parallel execution). LLM solo donde hay ambigüedad real.
- **Por qué importa:** Reduce coste, latencia, y superficie de no-determinismo.
- **Decisión/acción:** Adoptar como regla de diseño: justificar cada uso de LLM contra alternativa determinista.

### AI Fallback en aserciones
- **Origen:** Kastner postmortem.
- **Qué:** Si selector tradicional (Playwright) falla, escalar al LLM con DOM state para juicio.
- **Por qué importa:** Mitiga uno de los mayores costes de mantenimiento de E2E.
- **Decisión/acción:** Prototipar. Medir false positives — un LLM permisivo dice "yes" cuando algo está roto.

### Validation by parallel execution
- **Origen:** Kshirsagar — 3 Agents XPath (Agent 3 Validator).
- **Qué:** Correr versión original y refactorizada **en paralelo** contra el mismo entorno y comparar pass/fail. Único garante real de "zero regression".
- **Por qué importa:** Para cualquier refactor automático del framework (suites, selectores, prompts), validación independiente no es opcional.
- **Decisión/acción:** Adoptar. Cualquier "auto-migración" debe correr ambos lados y reportar diff.

### Coverage gap analysis como PR linter
- **Origen:** Amrutalohabare — AI Coverage Gaps Playwright.
- **Qué:** GitHub Action que en cada PR llama a LLM con tests + user stories y bloquea merge si detecta gaps high-risk.
- **Por qué importa:** Patrón replicable, valor inmediato. Pero la implementación naive (mandar todos los tests + gate por keyword) no escala.
- **Decisión/acción:** Adoptar la idea; rediseñar con structured output + incremental analysis.

---

## Tooling y arquitectura técnica

### OpenAI-compatible API como capa de portabilidad
- **Origen:** Kshirsagar — Local LLM Pipeline (Ollama/LM Studio).
- **Qué:** Si construyes contra la OpenAI API spec, local (Ollama) y cloud (OpenAI/Anthropic/etc.) son intercambiables a nivel de config, no de código.
- **Por qué importa:** Para clientes enterprise/regulated, el framework DEBE poder correr 100% local. Acoplarse al SDK de Anthropic directamente cierra esa puerta.
- **Decisión/acción:** Adoptar. Diseñar el framework contra una interface OpenAI-compatible. Wrap el SDK de Anthropic detrás de ella si hace falta.

### Local-first como requirement enterprise (no workaround)
- **Origen:** Kshirsagar — Local LLM Pipeline.
- **Qué:** En banca/seguros/salud el primer review de seguridad pregunta "¿dónde van los datos?" y si la respuesta es "API externa", la conversación termina ahí.
- **Por qué importa:** Posicionamiento de mercado. Si `nworld-qa-framework` no corre local, queda fuera del segmento más sólido.
- **Decisión/acción:** Adoptar como constraint NF #1. Cualquier feature debe poder funcionar con modelo local (aunque sea con downgrade de calidad).

### Modelo elegido por tarea, no por organización
- **Origen:** Kshirsagar — Local LLM Pipeline.
- **Qué:** No hay "el mejor modelo" — hay matriz tarea × tamaño × hardware constraint. Llama 3 8B vale para structured JSON, Mistral 7B para clasificación, Llama 3 70B Q4 para RAG multi-chunk.
- **Por qué importa:** Evita el lock-in tipo "el framework solo funciona con Opus" (anti-patrón observado en Kastner).
- **Decisión/acción:** Adoptar. Matriz declarativa de modelo recomendado por tipo de task en el framework.

### Versión del modelo como parte del contrato
- **Origen:** Kastner postmortem.
- **Qué:** El framework de Kastner depende explícitamente de Opus 4.6 — Sonnet rompe structured output.
- **Por qué importa:** Cambiar de modelo es breaking, no un bump. Hay que versionar matriz modelo × feature.
- **Decisión/acción:** Adoptar matriz de compatibilidad declarativa. Cada release del framework declara qué features están validadas contra qué modelos.

### PromptFoo + DeepEval/RAGAS como stack combinable
- **Origen:** Kshirsagar — PromptFoo. Reforzado por Garvanand (tooling landscape).
- **Qué:** PromptFoo (YAML, Git, variant comparison, CI-rápido) + DeepEval/RAGAS (deep retrieval metrics) cubren juntos lo que ninguno solo cubre completamente.
- **Por qué importa:** El framework no necesita reinventar eval; necesita orquestar.
- **Decisión/acción:** Estudiar ambos antes de decidir. Si el framework adopta PromptFoo como base, mantener escape hatch a DeepEval/RAGAS para casos avanzados.

### Eval the pipeline, not the model
- **Origen:** Kshirsagar — PromptFoo.
- **Qué:** PromptFoo apunta al endpoint del RAG pipeline (retrieval + generation), no al modelo aislado. Para RAG eso es la única opción correcta.
- **Por qué importa:** Si el framework expone "test the LLM", está mal framework. Lo que se testea es el sistema completo.
- **Decisión/acción:** Adoptar. API del framework debe apuntar a endpoints, no a modelos.

---

## Failure analysis y operational concerns

### Failure analysis con RAG histórico + classification taxonomy
- **Origen:** Singh — RAG en test automation.
- **Qué:** Cuando un test falla, retrievear failures históricas similares + RCAs previos + deployments + flaky patterns. Output = clasificación en 7 categorías (Product / Automation / Flaky / Environment / Data / Infra / Third-party) + confidence + similar defect cite.
- **Por qué importa:** Es el use case enterprise de mayor leverage. Reduce tiempo de triage drásticamente.
- **Decisión/acción:** Diseñar el framework con failure-analysis como módulo de primera clase, no add-on.

### Duplicate detection antes de crear bug
- **Origen:** Singh — RAG en test automation.
- **Qué:** Antes de auto-crear un Jira, comparar similitud con bugs existentes. Threshold (ej. 85%) decide create vs. link-and-comment.
- **Por qué importa:** Sin esto, automatización de bug creation rompe Jira. Es un requisito UX implícito.
- **Decisión/acción:** Adoptar como requirement del módulo de bug creation.

### Prompt logging como requisito no-funcional
- **Origen:** Kastner postmortem (`.qa-framework/` directory).
- **Qué:** Todo prompt + toda respuesta persistidos en disco. No opcional.
- **Por qué importa:** Sin esto, debugar un sistema no-determinista es imposible.
- **Decisión/acción:** Adoptar desde día 1. Definir esquema de directorio + retention policy.

### Severity matches block-severity (en CI)
- **Origen:** Kshirsagar — 3 Pipelines.
- **Qué:** Pipelines que dependen de servicios externos inestables (judge model API) generan warning, no bloquean merge. Pipelines deterministas sí bloquean.
- **Por qué importa:** Sin esto, un outage del judge model provider para el merge de la organización.
- **Decisión/acción:** Adoptar. Circuit breaker + severity routing en cada gate del framework.

### Living dataset — cada prod failure = nuevo golden case
- **Origen:** Kshirsagar — PromptFoo. Reforzado por Garvanand.
- **Qué:** Dataset estático = señal de abandono. Cada incident en producción debe convertirse en test case del golden set.
- **Por qué importa:** El framework debe facilitar esta promoción (UX para "promote this failure to permanent golden case").
- **Decisión/acción:** Adoptar. Diseñar workflow explícito de promoción.

### LLM-as-Judge failure modes (checklist)
- **Origen:** Garvanand.
- **Qué:** Verbosity bias (premia largos), self-serving bias (mismo family inflacta), vague rubrics ("is this good?" = inútil), missing ground truth.
- **Por qué importa:** Sin contramedidas explícitas, los scores del judge son theater, no medición.
- **Decisión/acción:** Adoptar como checklist obligatorio antes de poner cualquier LLM-as-Judge en producción dentro del framework.

---

## Workflow / build-time concerns

### Build-time vs run-time separation (MCP)
- **Origen:** Sanaev — Playwright MCP. Refuerza Kastner regression-vs-exploratory.
- **Qué:** Playwright MCP es para el QA inspeccionando la app en su IDE. Playwright CLI corre el test final en CI sin MCP.
- **Por qué importa:** No acoplar producción del test runner a un protocolo de inspección. Esa frontera define qué pertenece a `nworld-qa-framework-cli` vs. a un eventual `nworld-qa-framework-explorer`.
- **Decisión/acción:** Adoptar como separación de paquete/binary.
