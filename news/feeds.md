# RSS Feeds — Fuentes verificadas

Feeds **verificados** (devuelven XML válido a fecha 2026-06-01). Cuando alguno
deje de responder, marcarlo como ❌ y buscar reemplazo.

## ⭐ Top 3 (lo que más nos interesa)

Los tag feeds de Medium agregan a **todo el mundo** que publica con ese tag —
es la forma más eficiente de cubrir el ecosistema sin seguir autores uno a uno.

| Feed | URL | Por qué |
|---|---|---|
| Medium · `ai-testing` | https://medium.com/feed/tag/ai-testing | Núcleo de lo que queremos rastrear |
| Medium · `llm-testing` | https://medium.com/feed/tag/llm-testing | Específico de LLMs |
| Medium · `test-automation` | https://medium.com/feed/tag/test-automation | Cobertura del estado general del arte |

> ⚠️ **Limitación del feed de Medium:** sólo devuelve título + un excerpt de ~20-30 palabras. El cuerpo del artículo NO viene en el feed y los posts member-only siguen detrás del paywall. El feed sirve para **descubrir** qué se está publicando; para **leer** el artículo completo, ver [`paywall-workflow.md`](paywall-workflow.md).

## Blogs de empresa / industria

| Feed | URL | Estado | Foco |
|---|---|---|---|
| Ministry of Testing (agregador) | https://feeds.feedburner.com/mottestingfeeds | ✅ | Agregador comunitario QA — alto volumen, ya mezcla Medium/Substack/blogs |
| BrowserStack Blog | https://www.browserstack.com/blog/feed/ | ✅ | Mucho contenido AI testing 2026 (State of AI in Testing report, Breakpoint) |
| Applitools Blog | https://applitools.com/blog/feed/ | ✅ | Visual AI testing, autonomous testing |
| Qualitest | https://www.qualitestgroup.com/feed/ | ✅ | Consultora QA — GenAI en banca, casos enterprise |
| Thoughtworks Insights | https://www.thoughtworks.com/rss/insights.xml | ✅ | Agentic systems, AI engineering — no QA puro pero contexto relevante |

## Candidatos pendientes (no verificados — sin RSS público encontrado)

Estos blogs son relevantes pero **no exponen RSS** (o cambió la URL). Si los queremos
seguir, hay que usar otra vía (newsletter / scrape manual / buscar en feedspot).

- **TestGuild** (`testguild.com`) — su `/feed/` devuelve 404 a fecha de hoy
- **Confident AI** (`confident-ai.com/blog`) — sin RSS público
- **Langfuse blog** — sin RSS público
- **Playwright blog** — sin RSS público
- **Anthropic news** — sin RSS público
- **Cypress blog** — `blog.cypress.io` redirigió y rompió el feed

## Cómo lo usamos

1. **Lectura puntual:** me pasas la URL del feed y reviso titulares recientes con `WebFetch`.
2. **Curación periódica:** cada X días reviso los Top 3 + los blogs de empresa, y mando a `news/inbox/` los items que merecen análisis.
3. **Filtrado:** no todo lo que aparece en `ai-testing` o `llm-testing` es útil — mucho es marketing. La curación es el trabajo real.

## Cómo añadir un feed nuevo

1. Verificar que la URL devuelve XML (probar con `WebFetch` antes de añadir).
2. Añadir fila en la tabla correspondiente con estado ✅.
3. Si deja de funcionar, mover a "Candidatos pendientes" con la nota del fallo.
