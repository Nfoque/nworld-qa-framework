---
title: "I replaced my entire QA team with Claude and Agentic Workflow"
author: Brent Kastner
publication: Level Up Coding (Medium)
published: 2026-02-23
url: https://medium.com/@brentkastner/...
related_repo: references/ai-qa-framework/  # ⚠️ es el mismo proyecto, no una referencia separada
status: 🔍 en estudio
relevance: ⭐⭐⭐⭐⭐ (muy alta — describe la motivación y los límites del repo que ya tenemos)
---

# Resumen

Postmortem honesto de Brent Kastner sobre `ai-qa-framework`, su experimento open-source
de QA totalmente autónomo con Claude Opus 4.6 + Playwright + Python. Conclusión del
propio autor: **"kind of works"**, sirve para exploración pero no para regresión, y el
equipo de QA "vuelve el lunes".

## Tesis central

La distinción clave que el autor extrae del experimento:

> **Regression testing demanda determinismo. Exploratory testing es intrínsecamente
> no-determinista. Los LLMs encajan en el segundo, no en el primero.**

Pretender que un LLM gate-keepea un pipeline de CI/CD es prematuro porque la
flakiness es estructural, no un bug a corregir.

## Arquitectura del experimento

- **Input mínimo:** URL + credenciales opcionales + algunos hints.
- **Pipeline:** crawl → extracción de links/CTAs/relations → generación de plan de tests → ejecución con Playwright → reporte.
- **Modelo:** Claude Opus 4.6 (Sonnet rompe la fiabilidad del JSON estructurado — nota técnica explícita del autor).
- **Volumen:** ~300s para generar plan de 50 tests con steps + criterios de aserción.

## Patrones reusables (alto valor)

1. **AI Fallback en aserciones.** Si Playwright no encuentra el selector esperado, escala al LLM con el estado de la página para emitir un juicio. Funciona "sorprendentemente bien".
2. **Tipos de testing combinables por config.** Functional / visual / light security mezclados en una sola corrida.
3. **Prompt logging.** Todo prompt + respuesta queda en `.qa-framework/` — transparencia obligatoria cuando construyes sobre algo no predecible.
4. **Reports visuales con evidencia por step.** Playwright captura cada paso con su condición y evidencia.

## Limitaciones honestas (que el autor admite)

- **Flakiness estructural.** Incluso con hints abundantes, hay drift en qué tests se eligen. Inaceptable para gates de release.
- **Velocidad.** Rápido frente a humano escribiendo, lento frente a suite ya escrita.
- **No reemplaza al ingeniero.** El valor humano está en: decisiones arquitectónicas, enforcement de patrones, juicio sobre qué test es significativo vs. superficial, detectar "confidently producing slop".

## Propuesta de hybrid model (el autor)

```
LLM ─► exploración / descubrimiento de tests
            │
            ▼
   Human curator ─► flag tests "core flow"
            │
            ▼
   Suite determinista regresión ◄── corre idéntica cada vez
```

El LLM no escribe la suite de regresión: la *propone*. El humano decide qué entra.

## Lo que se puede destilar a `research/`

→ Pendiente de añadir como insights:
1. Regression-vs-exploratory como criterio de diseño (no como detalle de implementación).
2. AI Fallback como patrón táctico para aserciones frágiles.
3. Prompt logging como requisito no-funcional desde día 1.
4. Lock-in del modelo: el framework depende de Opus por fiabilidad de structured outputs — implica que **versión de modelo es parte del contrato**, no un parámetro intercambiable.

## Lo que NO compramos

- La premisa del título ("I replaced my entire QA team") está pensada como clickbait — el propio autor lo desmonta al final ("they are all rejoining the team on Monday"). No debería influir en cómo nombramos o vendemos `nworld-qa-framework`.
- La idea de que un LLM autónomo cubra "exploración" tiene techo bajo si la organización no prioriza testing exploratorio (el propio autor admite que ningún equipo de producto lo hace en serio).

## Vínculo con el repo

El código vive en `references/ai-qa-framework/`. Cuando estudiemos su arquitectura, este artículo es el **mapa mental del autor** sobre por qué tomó cada decisión. Leerlos por separado pierde la mitad del valor.

## Acciones

- [ ] Auditar `references/ai-qa-framework/src/` con esta tesis en mente: ¿dónde está la frontera entre exploration y regression en el código?
- [ ] Capturar los 4 insights destilados en `research/insights.md`.
- [ ] Decidir si `nworld-qa-framework` se posiciona como "exploration + human-curated regression" o como otra cosa.
