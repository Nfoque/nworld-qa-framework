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

## Nota sobre el estado actual

Los signals abajo son **provisionales**. Vienen de un único cliente con 3 engagements paralelos en SaaS enterprise distintos (HR core, IT service mgmt, payroll). La regla del archivo exige ≥ 2 clientes independientes para que un patrón se considere "señal firme de roadmap". Estos signals son hipótesis a confirmar cuando lleguen reuniones del próximo cliente.

Marcados con `[1c-3e]` = observado en 1 cliente / 3 engagements (intra-cliente).

---

### Vendor-sin-acceso-al-tooling-del-cliente

- **Apariciones:** `[1c-3e]` (2 de 3 engagements de una cuenta SaaS enterprise: HR core + payroll)
- **Descripción:** El cliente contrata simultáneamente al **implementador del SaaS** (consultora del producto) y al **testing vendor**. El testing vendor opera dentro del tooling del cliente (Jira, etc.). Los implementadores **no tienen acceso a ese tooling** y no es viable conseguírselo en plazos cortos. Resultado: el flujo defect / test-case se rompe en el borde del vendor externo. Workaround típico: construir un Jira Form para que externos puedan crear defects sin acceso completo.
- **Cobertura actual del framework:** ❌ — es problema operativo / privilege management, no LLM-driven QA.
- **Anchor en research:** —
- **Acción:** monitorear. Si aparece en otro cliente, considerar si hay valor en automatizar el bridge defect-form ↔ Jira (pero probablemente sigue fuera de scope del framework actual).

---

### Regression suite como "gap reconocido, nunca construido"

- **Apariciones:** `[1c-3e]` (los 3 engagements). En palabras del propio cliente: *"testing is a big gap, has always been"*, *"we just test the change usually, no regression"*, *"we hope nothing breaks, find out when in production"*.
- **Descripción:** Equipos cliente reconocen explícitamente que la regression suite es un gap fundacional. La única regresión "decente" existe para platform upgrades 1-2x/año. Sprint-level regression no existe. Cada cambio se valida solo contra el cambio puntual, sin verificar que lo previamente funcional sigue funcionando.
- **Cobertura actual del framework:** ⚠️ Parcial — el framework distingue "regression vs exploratory" como criterio de diseño, pero el contenido está orientado a LLMs (eval frameworks). El gap aquí es enterprise SaaS regression suite construction — diferente dominio.
- **Anchor en research:** `research/insights.md#regression-vs-exploratory-como-criterio-de-diseño`, `research/patterns.md#golden-dataset-/-ground-truth-como-inversión-obligatoria` (la idea de "dataset construction es trabajo de primera clase").
- **Acción:** añadir a priorización del framework: **si hay una versión enterprise-SaaS del framework, regression-from-zero es el módulo más demandado**. Considerar un patrón "regression seed → growth" análogo al living dataset pero para test cases enterprise.

---

### Pipeline gating como aspiración no implementada

- **Apariciones:** `[1c-3e]` (2 de 3 engagements: una platform de seguridad SaaS + un módulo de payroll). El cliente *quiere* bloquear deploys ante test failures pero no ha invertido en el tooling.
- **Descripción:** El equipo cliente debate integrar tests en el pipeline para bloquear deploys ante fallo. En todos los casos: "es buena idea, no es trivial implementar en nuestro stack actual". El stack actual (ej. SaaS-specific deployment tools) no expone hooks limpios para gating, o el testing vendor no tiene acceso al CI/CD del cliente.
- **Cobertura actual del framework:** ✅ Alineado conceptualmente — el patrón "Build-time vs run-time separation" del framework dice exactamente esto: lo que asiste al QA durante diseño no debe estar en el path de ejecución CI, y lo determinista sí debe bloquear pipeline.
- **Anchor en research:** `research/patterns.md#build-time-vs-run-time-separation`.
- **Acción:** monitorear. Si esto se confirma con otros clientes, el framework podría posicionar su contribución como *"el lado run-time del split"* — un runner determinista que se enchufa al pipeline del cliente. Útil para diferenciarse del posicionamiento puro "LLM exploration".

---

### Test evidence como Word/screenshot/Sheets en sistema secundario

- **Apariciones:** `[1c-3e]` (los 3 engagements, cada uno con un tool distinto: comentarios Jira + screenshots adjuntos, Word docs en file storage del cliente, Google Sheets ad hoc).
- **Descripción:** La "captura de evidencia de test" sí existe en los 3 casos, pero nunca está estructurada. Cada engagement reinventa un formato distinto (screenshot pegado en ticket, doc adjunto a herramienta de deploy, sheet manual). Resultado: la evidencia no es trazable, ni queryable, ni reutilizable para construir regression suite.
- **Cobertura actual del framework:** ❌ — es problema de test management / structured artifacts.
- **Anchor en research:** —
- **Acción:** monitorear. La oportunidad de framework sería **schema obligatorio para test execution artifacts** (rationale + screenshot + ID + version + result), análogo al "schema obligatorio para outputs LLM" que ya recoge `research/patterns.md#confidence-+-cita-como-formato-de-output-llm`. Misma filosofía, dominio distinto.

---

### Cross-functional / integration impact testing como gap fundacional

- **Apariciones:** `[1c-3e]` (los 3 engagements). Casos observados: una platform que toca múltiples áreas (HR, IT service mgmt, asset mgmt, compliance); un sync diario entre dos SaaS críticos (HR → payroll); una migración a SaaS-recruitment con 2 plugins externos.
- **Descripción:** El SaaS o sus integraciones tocan múltiples módulos / sistemas / áreas funcionales. Sin matriz de dependencias documentada. Un cambio en un módulo puede romper otro sin previo aviso. El equipo cliente no testa el impacto cross-functional sistemáticamente.
- **Cobertura actual del framework:** ❌ Conceptualmente fuera de scope — el framework trata propiedades de outputs LLM individuales, no dependency-graph testing.
- **Anchor en research:** —
- **Acción:** monitorear. Si esto se repite, posible extensión del framework hacia **impact analysis** (qué tests correr cuando cambia el módulo X) — pero probablemente se construye con análisis estático del schema/config del SaaS, no con LLM. Cuña LLM posible: clasificar PRs por área de impacto y sugerir test suites a correr (análogo a "Coverage gap analysis como PR linter" pero invertido).

---

### Inheritance de test cases de vendor saliente

- **Apariciones:** `[1c-3e]` (2 de 3 engagements: vendor saliente dejó test cases en uno; en el otro el knowledge holder único sale del proyecto y bus factor = 1).
- **Descripción:** Cuando un vendor sale del engagement, deja un baseline de test cases (de UAT de proyecto cerrado, o de configuración manual hand-built). El nuevo vendor (NFQ) los hereda. Problema: estos artefactos fueron diseñados como **one-shot** (UAT para ir-vivo del proyecto cerrado), no como **regression continua**. Hay que catalogarlos, deduplicarlos, y reinterpretarlos como semilla del regression suite — no aplicarlos tal cual.
- **Cobertura actual del framework:** ⚠️ Parcial — el patrón "Living dataset (promotion-from-incident)" tiene la misma forma pero aplicado a fallos de producción, no a herencia de vendor. La idea de "el dataset es resultado acumulado, no artefacto inicial" se traduce bien aquí: convertir el baseline heredado en seed, no en truth.
- **Anchor en research:** `research/patterns.md#living-dataset-promotion-from-incident`.
- **Acción:** añadir nota a `research/patterns.md` sobre **otra fuente del living dataset: vendor-handover baseline**, no solo production incidents.

---

### Test management tooling decision con múltiples candidates simultáneos

- **Apariciones:** `[1c-3e]` (los 3 engagements). Combinaciones observadas: SaaS-native ATF vs side project interno vs herramienta del nuevo vendor; Jira+X-Ray vs Google Sheets legacy; Jira+Word-attachments vs algo estructurado por proponer.
- **Descripción:** El cliente está en medio de decidir su stack de test management — múltiples herramientas candidatas en paralelo, alguna nativa del SaaS (ATF), alguna construida internamente (side project), alguna propuesta por el nuevo vendor. El nuevo vendor entra como participante en la decisión, no como adopter.
- **Cobertura actual del framework:** ⚠️ — paralelo conceptual con "OpenAI-compatible API como capa de portabilidad": no acoplarse a un proveedor único. Aquí la lección: el framework debería ofrecer **una capa de abstracción sobre test management tooling**, no un binding a Jira o X-Ray específico.
- **Anchor en research:** `research/insights.md#openai-compatible-api-como-capa-de-portabilidad`.
- **Acción:** añadir a priorización: **constraint NF #2 del framework: test management agnóstico**. Si el framework genera/consume test cases, debe poder hacerlo contra Jira+X-Ray, Azure DevOps, TestRail, o un sheets ad hoc.

---

### Acceso a sistemas SaaS como bloqueante operativo del onboarding del vendor

- **Apariciones:** `[1c-3e]` (2 de 3 engagements: payroll SaaS donde "los roles existentes son demasiado amplios"; HR SaaS donde testers requieren "business roles" provisionados por equipo específico vía Jira tickets).
- **Descripción:** El nuevo vendor de testing necesita un rol específico para los testers en el SaaS del cliente. Los roles existentes son demasiado amplios (admin/dev → exceso de privilegios + restricciones de compliance) o demasiado restrictivos (business user → no puede testar). Hay que crear un **rol nuevo "tester"** vía authorization team del cliente. Esto bloquea operativamente las primeras semanas del engagement.
- **Cobertura actual del framework:** ❌ Operativo, fuera de scope.
- **Anchor en research:** —
- **Acción:** sin cambio en framework. Útil como **input al playbook de onboarding de engagements NFQ** — anticipar este bloqueante en la primera reunión.
