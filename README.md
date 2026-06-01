# NWorld QA Framework — Espacio de Investigación

Este workspace es el laboratorio para diseñar y construir **`nworld-qa-framework`**:
un framework de automatización de testing de software impulsado por LLMs (especialmente Claude).

## Estructura

| Carpeta | Propósito |
|---|---|
| `news/` | Noticias, artículos y publicaciones sobre QA automation + LLMs. Materia prima. |
| `references/` | Repositorios externos que estudiamos para extraer ideas, patrones y código. |
| `clients/` | Transcripciones de reuniones por cliente/proyecto + análisis. **Gitignored** (datos sensibles) — solo `clients/README.md` se sube. |
| `research/` | Síntesis: lo que destilamos de `news/`, `references/` y `clients/`. `insights.md` y `patterns.md` desde literatura, `client-signals.md` (sanitized) desde mercado real. |
| `nworld-qa-framework/` | El framework propio. Aquí aterrizan las decisiones finales. |

## Flujo de trabajo

```
       ┌─ news/        ─┐
       ├─ references/  ─┤
       │                 ├──►  research/  ──►  nworld-qa-framework/
       └─ clients/     ──┘     (destilado)       (producto)
        (mercado real,        insights.md
         gitignored)          patterns.md
                              client-signals.md
```

Dos fuentes de input:

1. **Literatura** (`news/` + `references/`) — qué dice el ecosistema. Destila a `insights.md` + `patterns.md`.
2. **Mercado real** (`clients/`) — qué nos piden los clientes. Sanitized, destila a `client-signals.md`.

Cuando una decisión de diseño se traza a entradas en ambos lados, es señal fuerte.

## Convenciones

- Cada artículo o repo añadido lleva una **nota breve** en el README de índice de su carpeta: qué es, por qué nos interesa, qué se puede destilar.
- `research/` no es un repo más: es nuestra opinión consolidada.
- `nworld-qa-framework/` se mantiene limpio — sólo entra lo que ya pasó por `research/`.
