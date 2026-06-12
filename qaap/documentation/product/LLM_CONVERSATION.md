# LLM API Pricing & Economics for QAAP

## How LLM APIs Charge

All providers charge **per token** (input + output separately). One token ≈ ¾ of a word in English, slightly less in Spanish.

---

## Provider Pricing (as of June 2025)

### Anthropic (Claude)

| Model | Input / 1M tokens | Output / 1M tokens | Best for |
|---|---|---|---|
| Haiku 4.5 | $1.00 | $5.00 | High-volume, simpler tasks (PlanAgent, ScenarioAgent) |
| Sonnet 4.6 | $3.00 | $15.00 | Balanced quality/cost (FeatureAgent) |
| Opus 4.8 | $5.00 | $25.00 | Maximum quality, complex reasoning |
| Fable 5 | $10.00 | $50.00 | Most capable, demanding reasoning |

**Cost-saving features:**
- **Prompt caching** — reduces input cost up to 90% on repeated system prompts/schemas
- **Batches API** — 50% discount for asynchronous processing (non-real-time jobs)

### OpenAI

| Model | Input / 1M tokens | Output / 1M tokens | Best for |
|---|---|---|---|
| GPT-4.1 mini | $0.40 | $1.60 | High-volume, simple tasks |
| GPT-4.1 | $2.00 | $8.00 | Balanced quality/cost |
| o3 | $2.00 | $8.00 | Reasoning tasks |
| o3-pro | $20.00 | $80.00 | Maximum reasoning quality |

### Local Models (Ollama — zero cost)

Since the pipeline spec mandates **OpenAI-compatible API** and **local-first**, any model running on Ollama (Llama 3, Mistral, Qwen, etc.) can be used at **$0.00** — only hardware cost (electricity + GPU).

---

## Cost Estimation for qaap-engine

### Typical Job: Medium Project (~50 RawChunks from GitHub + Jira + Figma)

| Stage | Agent Calls | Input Tokens (approx) | Output Tokens (approx) | Recommended Model |
|---|---|---|---|---|
| **FeatureAgent** | 1 | ~30K (all chunks) | ~5K | Sonnet 4.6 |
| **PlanAgent** | ~8 (1 per feature) | ~5K each (~40K total) | ~3K each (~24K total) | Haiku 4.5 |
| **ScenarioAgent** | ~25 (1 per test area) | ~3K each (~75K total) | ~2K each (~50K total) | Haiku 4.5 |

### Cost per Job by Strategy

| Strategy | FeatureAgent | PlanAgents (8×) | ScenarioAgents (25×) | **Total** |
|---|---|---|---|---|
| **Sonnet + Haiku** (recommended) | $0.17 | $0.16 | $0.33 | **~$0.66** |
| **Haiku only** (budget) | $0.06 | $0.16 | $0.33 | **~$0.55** |
| **Sonnet only** (quality) | $0.17 | $0.48 | $0.98 | **~$1.63** |
| **Opus only** (premium) | $0.28 | $0.80 | $1.63 | **~$2.71** |
| **Ollama** (local) | $0.00 | $0.00 | $0.00 | **$0.00** |

### Monthly Projection per Tenant

| Usage Level | Jobs/month | Cost (Sonnet+Haiku) | Cost (Haiku only) |
|---|---|---|---|
| Light | 10 | ~$6.60 | ~$5.50 |
| Medium | 50 | ~$33 | ~$27.50 |
| Heavy | 200 | ~$132 | ~$110 |

---

## Implications for QAAP Architecture

### 1. LLM Router is Key

The `DEFAULT_MATRIX` in the LLM Router routes by `task_type`. The `extraction` task type can assign different models per agent:
- FeatureAgent → Sonnet (needs to interpret diverse raw data)
- PlanAgent / ScenarioAgent → Haiku (structured extraction from already-interpreted features)

### 2. prompt_logs Table = Cost Tracking

Every LLM call is logged to `prompt_logs` (non-negotiable NFR). This enables:
- Per-tenant cost calculation
- Per-job cost breakdown
- Cost anomaly detection
- Usage-based billing if needed

### 3. Prompt Caching Opportunity

The system prompt + project schema repeats across all parallel agent calls within a job. With Claude's prompt caching:
- PlanAgent (8 calls): system prompt cached after first call → ~90% input savings on calls 2-8
- ScenarioAgent (25 calls): even bigger savings

### 4. Batches API for Non-Interactive Jobs

When a tenant queues a job and doesn't need real-time results, the Batches API gives 50% discount. Could be offered as a "background processing" option.

### 5. Local-First = Zero Marginal Cost

For tenants running Ollama locally, the entire pipeline runs at $0.00 per job. This is a key differentiator: QAAP is not locked to any provider. The OpenAI-compatible API abstraction means swapping between cloud and local is a config change, not a code change.

---

## Second Opinion Stage Cost

Stage 4 (Second Opinion) adds an additional LLM call per scenario for verification. With ~25 scenarios per job:
- Using Haiku: ~$0.33 extra per job
- Using a different provider (for true independence): varies by provider

**Total with Second Opinion: ~$1.00 per job** (Sonnet + Haiku strategy)

---

## Summary

The per-job cost for qaap-engine is remarkably low ($0.50–$2.50 depending on model strategy). This means:
- A SaaS margin of 3-5× on LLM costs is sustainable
- Local-first option eliminates LLM costs entirely
- The LLM Router + prompt_logs combination enables fine-grained cost optimization per tenant
- Prompt caching and Batches API can reduce costs by 50-90% in specific scenarios
