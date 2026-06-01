# Client signals — qué nos piden los clientes (cross-client, sanitized)

Síntesis sanitizada de necesidades de testing observadas en reuniones con clientes.
Los datos originales viven en `clients/` (gitignored, local-only). Aquí solo entra
el patrón agregado, sin nombres ni detalles que identifiquen al cliente.

Esta es **la otra mitad** del input a la priorización del framework:

- `research/insights.md` y `research/patterns.md` = qué dice el ecosistema (literatura, postmortems públicos).
- `research/client-signals.md` (este archivo) = qué dice el mercado real (NFQ engagements).

Cuando una misma necesidad aparece en ≥ 2 clientes independientes, sube aquí y se
vuelve **señal de roadmap** para `nworld-qa-framework/`.

## Formato

```
### [Necesidad]
- **Apariciones:** N clientes (industria / tipo de proyecto, sin nombres)
- **Descripción:** qué piden — formulado de forma genérica
- **Cobertura actual del framework:** ✅ / ⚠️ / ❌
- **Anchor en research:** trazado a `research/insights.md#...` si aplica
- **Acción:** añadir a priorización / monitorear / sin cambio
```

---

_(vacío — se irá rellenando cuando procesemos las primeras reuniones)_
