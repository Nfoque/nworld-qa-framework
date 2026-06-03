# Patrones recurrentes

Patrones que aparecen repetidamente al cruzar noticias y repos. Si algo aparece
una sola vez es un *insight*; si aparece varias veces y empieza a verse como
norma del dominio, es un *patrón* y vive aquí.

## Formato

```
### [Nombre del patrón]
- **Apariciones:** lista de orígenes donde lo hemos visto
- **Descripción:** qué es y cómo se manifiesta
- **Implicación para nworld-qa-framework:** cómo lo aplicamos (o por qué no)
```

---

### Descomposición en 3 capas / 3 agentes / 3 pipelines
- **Apariciones:**
  - Kshirsagar — 3 Pipelines (structural / semantic / regression)
  - Kshirsagar — 3 Agents XPath (Archaeologist / Refactor / Validator)
  - Kastner — `references/ai-qa-framework/` (crawl / plan / execute reports)
  - Pattnaik — pytest/OpenShift (serving API / output quality / RAG pipeline)
- **Matiz nuevo (Pattnaik):** sus 3 capas no son fases secuenciales sino **dimensiones de calidad apiladas por dependencia**: serving (¿responde?) → output quality (¿es buena la respuesta?) → pipeline (¿el RAG trae lo correcto?). Sugiere que "3 capas" admite dos lecturas — pipeline temporal *y* stack de fiabilidad. La capa de **serving/infra (200/latencia/schema) es un Layer 0** que el resto del corpus asume implícito y nunca testea explícitamente.
- **Descripción:** Múltiples autores convergen en arquitecturas de **tres etapas especializadas**, donde cada etapa tiene un rol claro y la siguiente consume el output de la anterior con un contrato bien definido. No es coincidencia — refleja una descomposición natural del problema: *audit/discover → transform/generate → validate/regression*.
- **Implicación para nworld-qa-framework:** Adoptar la descomposición como esqueleto. **Tres responsabilidades ortogonales en lugar de un agente monolítico que hace todo**. El nombre puede ser otro (no obsesionarse con que sean "3"), pero la separación de fases sí.
- **Materializado en:** `nworld-qa-framework/protocol/v0.1-generation-protocol.md` (pipeline: parse → assemble → generate)

### Golden dataset / ground truth como inversión obligatoria
- **Apariciones:**
  - Kshirsagar — 3 Pipelines (120 queries construidos en 3 días)
  - Kshirsagar — PromptFoo (120 cases × 3 fuentes: prod logs, adversarial, regression)
  - Garvanand — Vibes-Based Deployment (golden cases con expected_tools, should_not_contain)
  - Kastner — implícito en sus "hints" injection
- **Descripción:** Todo framework de eval depende de un dataset cuidadosamente construido. Si está mal hecho, todos los scores son ruido. No hay shortcut. **Tres fuentes obligatorias**: production logs (intent real), adversarial prompts (known failure modes), regression cases (bugs históricos).
- **Implicación para nworld-qa-framework:** **Dataset management es módulo de primera clase**, no un detalle. El framework debe ofrecer tooling explícito para: ingestar de logs, etiquetar como adversarial, promote-from-prod-failure. Sin esto, el resto del framework no produce señal fiable.

### Confidence + cita como formato de output LLM
- **Apariciones:**
  - Kshirsagar — 3 Agents XPath (confidence score 0-100 + rationale + routing)
  - Singh — RAG failure analysis ("Confidence: 87%. Similar to DEF-1023")
  - Garvanand — LLM-as-Judge con thresholds + rationale
- **Descripción:** Los outputs útiles de un LLM en contexto QA **nunca** son solo el juicio — son juicio + confidence + cita verificable (al ground truth, a un caso similar, o a una referencia). Permite routing automático y auditoría.
- **Implicación para nworld-qa-framework:** **Schema obligatorio** para outputs LLM en el framework: `{judgment, confidence, rationale, references[]}`. No aceptar outputs raw como API pública.
- **Materializado en:** `nworld-qa-framework/protocol/v0.1-generation-protocol.md` (regla de calidad #2: confidence + rationale)

### Build-time vs run-time separation
- **Apariciones:**
  - Sanaev — Playwright MCP (MCP en build, CLI en run)
  - Kastner — regression vs exploratory testing
  - Kshirsagar — 3 Pipelines (eval semantic depende de external judge → no bloquea; structural/regression sí bloquean)
- **Descripción:** Lo que asiste al QA durante el diseño del test **no debe** estar en el path de ejecución del test en CI. Hay una frontera dura entre herramientas de exploración (LLM en loop con el ingeniero) y herramientas de regresión (deterministas, reproducibles, en pipeline).
- **Implicación para nworld-qa-framework:** Probable división en dos paquetes/binarios: uno con dependencias pesadas (LLM, MCP) para uso interactivo, otro ligero y determinista para CI. **No mezclar.**
- **Materializado en:** `nworld-qa-framework/architecture/adr-001-framework-form.md` (skill-first = build-time; Playwright CLI = run-time)

### OpenAI-compatible API como capa de portabilidad
- **Apariciones:**
  - Kshirsagar — Local LLM Pipeline (Ollama expone OpenAI-compatible REST)
  - Garvanand — tooling landscape (Langfuse/LangSmith/Arize todos abstraen sobre múltiples providers)
  - Singh — stack genérico ("LLM: GPT / Claude" intercambiables a nivel de capa)
- **Descripción:** El ecosistema converge en la spec OpenAI como interface común. Modelos locales (Ollama, LM Studio), gateways (LiteLLM), observability tools — todos hablan ese protocolo.
- **Implicación para nworld-qa-framework:** Construir contra esta interface, NO contra el SDK específico de Anthropic. Si necesitamos features Claude-specific (caching, citations, computer use), exponerlas como extensiones de la interface base, no como acoplamiento directo. **Esta decisión es load-bearing** — la portabilidad local/cloud depende de ella.
- **Materializado en:** `nworld-qa-framework/architecture/adr-001-framework-form.md` (apéndice: selección de modelo)

### Tool stack convergente (eval & observability)
- **Apariciones:**
  - Garvanand — explicit ("Langfuse, LangSmith, Arize, Galileo")
  - Kshirsagar — DeepEval, PromptFoo, RAGAS
  - Singh — LangChain, LlamaIndex, ChromaDB, Pinecone
- **Descripción:** Hay convergencia clara sobre qué herramientas componen el stack:
  - **Eval/judge:** DeepEval, RAGAS, PromptFoo
  - **Observability/tracing:** Langfuse, LangSmith, Arize, Galileo, Braintrust
  - **Orchestration:** LangChain, LlamaIndex, LangGraph
  - **Vector store:** ChromaDB, Pinecone, Qdrant
- **Implicación para nworld-qa-framework:** No reinventar estas capas. **Integrar** con las opciones más obvias y dejar que el usuario elija. La aportación del framework es la orquestación + el dominio QA-específico (golden datasets, regression baselines, failure analysis), no las primitivas de eval/tracing.
- **Gotcha de lock-in (Pattnaik, 2026-06-02):** **DeepEval tiene una dependencia dura de OpenAI que no se puede override** — inservible en setups local-first / multi-provider. Pattnaik tuvo que reemplazarlo por una función judge custom (Groq). Refuerza la decisión "OpenAI-compatible API como capa de portabilidad": al integrar tooling de eval, verificar que el judge sea swappeable, no cableado a un provider.

### Properties over content (varias formas)
- **Apariciones:**
  - Kshirsagar — 3 Pipelines (asserting on structural, semantic, regression properties)
  - Kshirsagar — PromptFoo (criteria-based expected outputs, no string match)
  - Garvanand — trajectory eval (asserting on tool selection & path, not just final text)
  - ElAmir — Genkit/Go ("score, don't assert" → `score >= threshold`, no `== expected`)
  - Pattnaik — pytest/OpenShift ("score, don't assert" explícito como lección #1)
- **Nota de consolidación (2026-06-02):** ya son **5 fuentes independientes** convergiendo en "score, don't assert". Deja de ser insight emergente — es la norma del dominio. Cualquier API de assertions del framework que ofrezca igualdad literal como ciudadano de primera clase está mal diseñada.
- **Descripción:** Tres autores, tres ángulos, misma idea: **no compares contenido literal — declara qué propiedad esperas y asserta sobre ella**. El "content" cambia entre runs sin perder corrección; la "property" se mantiene si el modelo hace su trabajo.
- **Implicación para nworld-qa-framework:** API de assertions del framework debe nudgear hacia property declarations, no string equality. Probable: tipos de assertion explícitos (`assertGrounded`, `assertReferencesEntity`, `assertWithinLengthBounds`, `assertSimilarTo(baseline, threshold)`).
- **Materializado en:** `nworld-qa-framework/protocol/v0.1-generation-protocol.md` (regla de calidad #1), `nworld-qa-framework/protocol/prompt-templates/generate-e2e-spec.md`

### Negative-retrieval test (fake-fact injection)
- **Apariciones:**
  - Pattnaik — pytest/OpenShift (inyecta `"the secret deployment colour is ULTRAVIOLET"` en el vector store y assertia que el modelo lo usa)
- **Descripción:** Para validar que un pipeline RAG **realmente recupera** y no responde de memoria de training: planta en el vector store un hecho que el modelo no puede saber (falso, único, ausente del corpus de entrenamiento) y verifica que aparece en la respuesta. Si sale → retrieval funciona. Si el modelo da la respuesta "real" desde memoria → el RAG está roto aunque el output parezca correcto. Es el dual del test de hallucination: en vez de "¿inventó algo fuera del contexto?", pregunta "¿usó de verdad el contexto que le di?".
- **Implicación para nworld-qa-framework:** Primitiva de assertion para RAG: `assertAnswerDerivedFromContext(injectedFact)`. Distingue dos fallos que un eval de output puro confunde — respuesta correcta-pero-por-la-razón-equivocada (memoria) vs correcta-por-retrieval. Solo una aparición por ahora → es **insight fuerte, todavía no patrón**; vigilar si reaparece.

### Living dataset (promotion-from-incident)
- **Apariciones:**
  - Kshirsagar — PromptFoo (dataset como living document, rebaselineado con cada cambio de modelo)
  - Garvanand — "every production failure that reaches a user is a new test case you should have had"
- **Descripción:** El golden dataset no es artefacto inicial — es **resultado acumulado** del operar el sistema. Cada incident debe convertirse en nuevo case del set.
- **Implicación para nworld-qa-framework:** UX explícita de "promote this failure to permanent test case". No es una nice-to-have; es lo que distingue un framework usado de uno abandonado.
