---
title: "Testing Automation, What are Pyramids and Diamonds?"
author: Ritesh Kapoor
date: 2022-01-01
url: https://ritesh-kapoor.medium.com/testing-automation-what-are-pyramids-and-diamonds-67494fec7c55
status: ✅ destilado
relevance: ⭐⭐
---

# TL;DR

Artículo **fundacional, no-LLM (Ene 2022)**. Repaso de las 3 formas de distribuir esfuerzo de testing: **Pirámide** (Cohn — mucho unit, poco E2E), **Pirámide invertida / ice-cream cone** (anti-patrón: mucho manual/E2E), y **Diamante** (peso en integration). Lo dejaste en el inbox como **ancla conceptual** para contrastar con "The AI Testing Pyramid Has Been Rewritten" — la base que esos artículos de 2026 dan por reescrita.

## Las tres formas

| Forma | Peso | Cuándo | Veredicto |
|---|---|---|---|
| **Pirámide** (Cohn, *Succeeding with Agile*) | base unit → integration → E2E (poco) → manual (mínimo) | default sano | estándar de la industria |
| **Invertida / ice-cream cone** | mucho E2E+manual, poco unit | prototipos / PoC donde el suite es desechable | anti-patrón fuera de eso (caro, frágil, lento) |
| **Diamante** | peso en **integration**, unit y E2E adelgazados | microservicios: testear interacción entre servicios da más confianza que unit | gana tracción en arquitecturas distribuidas |

Notas del autor:
- En microservicios, los integration tests "valen más" que los unit — pero con **mocks** que representen servicios externos, no servicios reales (tests aislados).
- E2E sigue siendo caro de desarrollar y mantener → minimizarlo (ecos del "Just say no to more E2E tests" de Google).
- "No hay estrategia correcta o incorrecta; es lo que funcione para ti."

## Por qué importa para nosotros (el puente a 2026)

- La tesis de los artículos AI-QA de 2026 ("la pirámide ha sido reescrita") presupone **esta** pirámide como punto de partida. Tener la base explícita evita aceptar el reframe sin contraste.
- El **eje vertical histórico = coste/velocidad/aislamiento** (unit barato/rápido/aislado → E2E caro/lento/realista). La pregunta abierta del lab: **¿cuál es el eje cuando la capa que se testea es un LLM?** No es coste de ejecución sino **determinismo del output** — y ahí la "forma" deja de mapear a tipos de test y empieza a mapear a **tipos de propiedad evaluada** (structural / semantic / behavioral), como ya apuntaba Kshirsagar ([[2026-05-08-kshirsagar-three-pipelines-500-assertions]]).

## Qué destilamos a `research/`

→ Contexto fundacional, no patrón accionable:
- Anotar en `insights.md` la hipótesis: **"la pirámide de tests es un eje de coste/aislamiento; para LLMs el eje relevante es determinismo del output → la forma se reorganiza por tipo de propiedad, no por tipo de test."** Conecta el reframe de 2026 con su base de 2022.

## Referencias del artículo (clásicos útiles)

- Fowler — [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) · [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- Google Testing Blog — [Just say no to more E2E tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
- Spotify Engineering — [Testing of microservices](https://engineering.atspotify.com/2018/01/11/testing-of-microservices/)
- [Test automation diamond](https://eason.blog/posts/2020/03/test-automation-diamond/)
