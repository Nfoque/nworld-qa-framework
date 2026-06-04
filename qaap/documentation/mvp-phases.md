# QAAP — MVP Phases

## Phase 1: Smallest Useful Product (8-10 semanas)

**Proposicion de valor: "Pega tus fuentes, obten una suite Gherkin de regresion, descargala."**

### Incluye

- **Auth**: Single-tenant (sin SSO — email/password con Better Auth)
- **Modality**: Solo Web (target Playwright)
- **Plan CRUD**: Crear plan, nombrar, describir scope, seleccionar framework
- **Context Sources**: Free text (pegar requisitos) + URL a OpenAPI spec + Jira ticket key manual (sin API, solo key para tagging)
- **Pipeline**: Parse OpenAPI + free text → assemble context → LLM genera Gherkin con `{confidence, rationale}`
- **Gherkin Editor**: Ver, editar, aprobar/rechazar escenarios individuales (Tiptap con syntax highlighting)
- **LLM**: Single provider (Claude via OpenAI-compatible API). Configurable model
- **Chat Panel**: Human-in-the-loop basico — "Add negative case for expired card" → LLM refina escenarios
- **Auto-codificacion**: Gherkin → Playwright test code
- **Export**: Download `.feature` (Gherkin) + `.spec.ts` (Playwright)
- **Prompt Logging**: Cada LLM call se registra en DB (prompt, response, model, tokens, latency)
- **Confidence Routing Visual**: Escenarios coloreados — verde (>=85%), amarillo (60-84%), rojo (<60%)

### NO incluye

- Multi-tenant, SSO, branding por tenant
- Conectores API (Jira, GitHub, S3 via API)
- Second opinions (multi-modelo)
- Ejecucion de tests en plataforma
- Cron scheduling
- Reports (mas alla de los archivos descargados)
- Modalidad API o iOS
- Push a repo

### Validacion MVP

El MVP valida la hipotesis central: **el pipeline (parse → assemble → generate → review → codify) produce output util que un QA expert aprobaria?**

Criterios de exito:
1. Un QA expert puede crear un plan, generar escenarios, y refinarlos via chat en <30 minutos
2. >=60% de los escenarios generados son aprobados sin modificacion
3. El codigo Playwright generado compila y es ejecutable (no necesita pasar — solo compilar)

---

## Phase 2: Multi-Tenant + Connectors (6-8 semanas)

### Incluye

- **Multi-tenant**: RLS en toda tabla, CRUD tenants, administracion
- **Branding**: MUI ThemeProvider con colores/logo/fuente por tenant
- **SSO**: Better Auth con OIDC per tenant (Okta, Azure AD, Google Workspace)
- **Conector Jira**: Pull tickets + ACs, push resultados a XRay
- **Conector GitHub**: Pull source code + OpenAPI specs, push tests como PRs
- **Conector S3/Docs**: Upload y ingest de documentos de requisitos
- **Second Opinions**: Configurar modelo de review, cadena de jobs BullMQ: generar → review → merge con provenance
- **Multi-LLM Config**: Model matrix por tenant (que modelo para que tarea)
- **Ejecucion Basica**: Ejecutar Playwright tests en Docker container, recoger resultados
- **Export XRay**: Sync resultados a Jira XRay
- **Tenant Resolution**: Subdomain-based (`acme.qaap.dev`)

### Criterios de exito
1. Dos tenants operando simultaneamente con datos aislados
2. SSO funcional con al menos un proveedor OIDC
3. Jira pull → generation → approval → XRay push cycle completo

---

## Phase 3: Execution + API Modality + Health (6-8 semanas)

### Incluye

- **Modalidad API**: Karate framework support (OpenAPI → Karate features → codify)
- **Ejecucion In-Platform**: Runners containerizados (Playwright en Docker, Karate en Docker), progreso real-time via SSE
- **Cron Scheduling + Branch Filtering**: Regresiones diarias por rama (main, develop, feature/*), por PR, por push
- **Failure Analysis**: RAG-based con pgvector (embedding test failures + historical RCAs). Taxonomia 7 categorias (product/automation/flaky/env/data/infra/third_party)
- **Living Dataset**: Promover failures a nuevos test scenarios (cada fallo de prod se convierte en golden test case)
- **Health Dashboard**: Trends de pass rate, flaky tracker, degradation detection, alertas configurables
- **Reporting Completo**: HTML, PDF, JUnit XML, XRay push
- **Report Delivery**: Email, Slack, Teams, webhooks. Auto-deliver despues de cada ejecucion programada. Templates branded por tenant
- **Conectores Adicionales**: GitLab, Bitbucket, Google Drive, Linear, Trello
- **Coverage Gap Analysis**: PR trigger → "que tests faltan para este cambio?"

### Criterios de exito
1. Suite de 50+ tests ejecutandose nightly via cron en 2 environments
2. Health dashboard muestra trends reales de 2+ semanas de ejecuciones
3. Reportes auto-delivered via email despues de cada nightly run
4. Al menos 1 failure classification correcta validada por QA expert

---

## Phase 4: Proactive AI + Enterprise + iOS (ongoing)

### Incluye

- **AI Fix Proposals**: Deteccion proactiva de bugs, propuestas de fixes exportables como PRs al repo del cliente
- **Source Change Impact**: Webhook de repo → analisis de impacto → re-run solo tests afectados
- **Branch Comparison**: Comparar pass rates entre ramas, detectar regresiones antes de merge
- **Helm Chart**: Documentado y testeado para on-prem + Ollama como LLM local
- **iOS Modality**: XCUITest placeholder architecture y primeros generators
- **SAML Support**: Para enterprises con ADFS
- **Audit Log**: Compliance-grade audit trail de toda operacion
- **RBAC Granular**: Roles por proyecto/plan (admin, editor, viewer, reviewer)
- **White-Label Completo**: Email templates, login pages, favicon, custom domain por tenant
- **Push Notifications**: PagerDuty, OpsGenie integration para critical failures
- **Token Usage & Billing**: Dashboard de costes LLM por tenant/plan

### Criterios de exito
1. Al menos 1 AI fix proposal aceptada y convertida en PR exitosamente
2. Deployment on-prem con Ollama funcionando sin API keys externas
3. Source change trigger re-runs solo tests impactados (no toda la suite)
