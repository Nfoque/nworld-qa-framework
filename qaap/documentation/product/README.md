# Product Specs

Product-level documentation for QAAP — QA Automation Platform.

## Documents

| Document | Description | Key content |
|----------|-------------|-------------|
| [architecture-plan.md](architecture-plan.md) | System architecture | Tech stack, modular monolith, modules, multi-tenancy, data flow |
| [domain-model.md](domain-model.md) | Data model | All entities (Tenant, User, TestPlan, TestScenario, Execution, etc.), RLS policies |
| [mvp-phases.md](mvp-phases.md) | Roadmap | 4 phases with scope, inclusions/exclusions, success criteria |
| [connector-spec.md](connector-spec.md) | Integrations | Connector interface, provider catalog (Jira, GitHub, S3, etc.), credential security |
| [llm-pipeline-spec.md](llm-pipeline-spec.md) | AI pipeline | 7-stage pipeline, multi-LLM routing, prompt templates, failure analysis |
| [design-handoff.md](design-handoff.md) | UI/UX | Screen inventory, component patterns, navigation, user flows |
| [nfq-branding.md](nfq-branding.md) | Branding | NFQ brand guidelines, color palette, typography, logo usage |

## Reading Order

1. **architecture-plan.md** — understand the system
2. **domain-model.md** — understand the data
3. **mvp-phases.md** — understand what's in scope
4. **connector-spec.md** + **llm-pipeline-spec.md** — deep dives on the two core subsystems
5. **design-handoff.md** — UI/UX reference for implementation
6. **nfq-branding.md** — brand compliance for the UI
