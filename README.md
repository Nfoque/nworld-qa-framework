# NWorld QA Framework — Espacio de Investigación

Este workspace es el laboratorio para diseñar y construir **`nworld-qa-framework`**:
un framework de automatización de testing de software impulsado por LLMs (especialmente Claude).

## Estructura

| Carpeta | Propósito |
|---|---|
| `news/` | Noticias, artículos y publicaciones sobre QA automation + LLMs. Materia prima. |
| `references/` | Repositorios externos que estudiamos para extraer ideas, patrones y código. |
| `research/` | Síntesis: lo que destilamos de `news/` + `references/`. Insights y patrones. |
| `nworld-qa-framework/` | El framework propio. Aquí aterrizan las decisiones finales. |

## Flujo de trabajo

```
news/  +  references/   ─►   research/   ─►   nworld-qa-framework/
   (input)                  (destilado)         (producto)
```

1. **Recolectar** — añadir noticias en `news/inbox/` y nuevos repos en `references/`.
2. **Estudiar** — anotar cada item en su README de índice (qué aporta, qué no).
3. **Destilar** — extraer patrones recurrentes a `research/`.
4. **Construir** — aplicar lo aprendido en `nworld-qa-framework/`.

## Convenciones

- Cada artículo o repo añadido lleva una **nota breve** en el README de índice de su carpeta: qué es, por qué nos interesa, qué se puede destilar.
- `research/` no es un repo más: es nuestra opinión consolidada.
- `nworld-qa-framework/` se mantiene limpio — sólo entra lo que ya pasó por `research/`.
