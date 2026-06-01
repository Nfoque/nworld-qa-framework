# Clients — Transcripciones de reuniones y análisis

Carpeta donde organizamos las **transcripciones de reuniones con clientes** y el
análisis destilado de cada engagement. Lo usamos para alimentar dos cosas:

1. **Decisiones tácticas por proyecto** — qué necesita el cliente, qué de nuestro framework le sirve hoy, qué le falta.
2. **Priorización del framework** — cuando la misma necesidad aparece en varios clientes, sube a `research/client-signals.md` y se vuelve un signal de roadmap.

## ⚠️ Privacidad

El repo `Nfoque/nworld-qa-framework` es **público en Nfoque**. Por seguridad:

- **Todo el contenido bajo `clients/` está gitignored** (excepto este README).
- Las transcripciones, los análisis por reunión, los nombres de clientes, **NO se suben al repo**.
- Solo lo *sanitized* (cross-client, sin nombres) sube a `research/client-signals.md`.

Si abres una nueva carpeta de cliente, se queda local en tu máquina. Nadie más en NFQ la ve.

## Estructura por cliente / proyecto

```
clients/
├── README.md                                ← este archivo (committable)
└── <client-slug>/                           ← un cliente
    └── <project-slug>/                      ← un engagement / proyecto concreto
        ├── project-state.md                 ← snapshot vivo (rolling)
        ├── transcripts/
        │   ├── raw/                         ← drop zone — pega aquí Fathom JSON, texto crudo de Zoom, etc.
        │   └── processed/                   ← slim/cleaned versions
        └── meetings/
            └── YYYY-MM-DD-topic.md          ← un fichero por reunión, análisis estructurado
```

Slugs en kebab-case (`acme-bank`, `risk-platform-rev2`).

## Workflow de procesar una reunión

1. **Tú** dejas la transcripción en `clients/<client>/<project>/transcripts/raw/`:
   - **Fathom:** exporta el JSON o markdown desde Fathom, déjalo aquí.
   - **Zoom / Teams / otros:** copia-pega el texto a un `.txt` o `.md` y déjalo aquí.
2. **Tú me dices** "procesa la reunión X" (o "procesa transcripts de cliente Y").
3. **Yo** hago:
   - Si es Fathom raw → lo paso por el skill `rawlie-agentic-tooling:fathom-slim-transcript` (instalado en tu máquina) → versión slim a `transcripts/processed/`.
   - Si es texto crudo → lo leo directamente.
   - Extraigo **necesidades de testing** del cliente (functional / E2E / perf / security / LLM eval / RAG / agentic / etc.).
   - Cruzo con `research/insights.md` y `research/patterns.md` para mapear: ¿qué de nuestro framework actual cubre cada necesidad?
   - Identifico **gaps** = lo que el cliente pide y nuestro framework no cubre todavía.
   - Genero `meetings/YYYY-MM-DD-topic.md` con el análisis estructurado.
   - Actualizo `project-state.md` (estado rolling del engagement).
4. **Si un gap se repite** en otro cliente, lo promociono (sanitizado) a `research/client-signals.md`.

## Plantilla per-reunión (`meetings/YYYY-MM-DD-topic.md`)

```markdown
---
client: <client-slug>
project: <project-slug>
date: YYYY-MM-DD
attendees: [nombres]
duration_min: 60
source: Fathom / Zoom / Teams / otro
status: ✅ analizado
---

# Reunión: <topic>

## Resumen ejecutivo (1-3 frases)

## Necesidades de testing identificadas

| Tipo | Contexto literal del transcript | Volumen / urgencia |
|---|---|---|
| ... | ... | ... |

## Mapping al framework actual

| Necesidad | Cobertura | Anchor |
|---|---|---|
| ... | ✅ / ⚠️ / ❌ | `research/insights.md#...` |

## Gaps detectados

- **Gap 1:** descripción — prioridad: alta/media/baja
- ...

## Decisiones / next steps acordados

## Citas relevantes
> "..."
```

## Plantilla `project-state.md` (snapshot rolling)

```markdown
# <Client> / <Project> — Estado

## Snapshot
- Inicio: YYYY-MM-DD
- Última reunión: YYYY-MM-DD
- Status: discovery / design / build / live

## Necesidades de testing (consolidadas)

## Cobertura por nworld-qa-framework
- ✅ Lo que ya cubre
- ⚠️ Parcial
- ❌ Gaps

## Histórico
- [YYYY-MM-DD — topic](meetings/YYYY-MM-DD-topic.md)
```
