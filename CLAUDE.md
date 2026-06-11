# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Research and design workspace for two products:

1. **qa-framework** (`qa-framework/`) — Skill-first framework for automatic E2E test generation with Playwright + LLM. Consumed as Claude Code skills (`.md` files copied to `.claude/commands/`). No binary, no runtime, no dependencies.
2. **QAAP** (`qaap/`) — Multi-tenant SaaS platform (React 19 + Supabase) that productizes the framework's pipeline into a web app with connectors, multi-LLM orchestration, and execution.

There is no runnable code at the root level — this is a documentation/research monorepo. QAAP has its own `CLAUDE.md` at `qaap/CLAUDE.md` with build/dev/test commands.

## Repository Architecture

```
research/                    ← Consolidated findings from articles + client signals
  insights.md                   Key findings with decision/action (cited by ADRs)
  patterns.md                   Recurring patterns across 2+ sources
  client-signals.md             Sanitized market signals from NFQ engagements

news/                        ← Article processing pipeline
  feeds.md                      RSS sources (Medium tags, industry blogs)
  paywall-workflow.md           How to get paywalled content into the repo
  inbox/                        Processed article summaries (YYYY-MM-DD-author-slug.md)
  inbox/raw/                    Drop zone for raw downloads (.md/.pdf from browser)
  inbox/raw/processed/          Raw files already processed (moved here after distillation)

qa-framework/                ← The framework product (design docs, not executable code)
  STATUS.md                     Task vs. existing artifact map — check this first
  architecture/                 ADRs (adr-001 through adr-003)
  protocol/                     Generation pipeline spec + prompt templates
  parsers/                      Parser specs (source-code, openapi, jira, test-conventions)
  targets/                      Target project validation sequence
  validation/                   XRay reporter + verify pipeline

qaap/                        ← SaaS product (has its own CLAUDE.md)
  spa/                          React 19 SPA (Vite + MUI v9)
  backend/                      Supabase Edge Functions + PostgreSQL migrations
  documentation/                Product specs, 17 ADRs, scaffolding skills
  prototypes/                   HTML/Netlify prototypes

clients/                     ← Client engagement transcripts (gitignored, local-only)
references/                  ← Links to external repos studied (no code cloned)
```

## Key Workflows

### Processing a news article

1. User drops raw `.md` or `.pdf` in `news/inbox/raw/`
2. Read the raw content, create a distilled summary at `news/inbox/YYYY-MM-DD-author-slug.md` following the frontmatter format of existing articles (see any file in `news/inbox/` for the template)
3. Add entry to the index table in `news/README.md`
4. Move the raw file to `news/inbox/raw/processed/`
5. If insights are new, add to `research/insights.md` and/or `research/patterns.md`
6. If insights impact the framework or QAAP, update the relevant docs

### Processing a client meeting

1. Raw transcript goes in `clients/<client>/<project>/transcripts/raw/`
2. Process with Fathom slim transcript skill if Fathom JSON, or read directly
3. Generate structured meeting analysis at `clients/<client>/<project>/meetings/YYYY-MM-DD-topic.md`
4. Update `project-state.md` (rolling snapshot)
5. If a testing need appears in 2+ clients, promote (sanitized) to `research/client-signals.md`

## Research → Product Traceability

Every design decision must trace back to `research/insights.md` or `research/patterns.md`. Each ADR cites its origins. If something also has backing from `research/client-signals.md`, that's a strong signal. **Without a research trace, the decision does not go into the framework.**

The flow is one-directional:
```
news/ + references/ ──► research/insights.md ──► qa-framework/
                        research/patterns.md
clients/ (local)    ──► research/client-signals.md
```

## Design Principles (from research)

These are load-bearing — not aspirational guidelines but hard constraints validated across research:

- **Properties over content** — Assert on structural properties (visible, count, enabled), never literal text. 5 independent sources converge on "score, don't assert".
- **Static analysis first, LLM where ambiguity** — Justify each LLM use against a deterministic alternative.
- **Build-time vs run-time separation** — Skills/MCP for exploration (build-time), Playwright CLI for CI (run-time). Never couple them.
- **Confidence + rationale** — Every LLM output carries `{result, confidence, rationale}`. Routing: >=85% auto, 60-84% human review, <60% manual.
- **Local-first** — The framework must run with local models (Ollama). OpenAI-compatible API as portability layer, never lock to a provider SDK.
- **Strict convention contracts** — Prohibitive rules ("PROHIBITED", "ONLY") produce ~95% LLM compliance vs ~70% for descriptive guidelines ("prefer", "try to").

## Writing Conventions

- **Everything in English.** All documentation, research, article summaries, client docs, and skills. The only exception is `qaap/prototypes/` (UI copy may be in Spanish for demos).
- `research/insights.md` entries follow the format: title, origin, what, why it matters, decision/action, materialized in. See existing entries.
- `research/patterns.md` entries require 2+ independent sources. Format: title, appearances, description, implication for qa-framework.
- `clients/` content is **gitignored** — never reference client names or identifying details in committed files. Only sanitized, aggregated patterns go to `client-signals.md`.

## Available Skills (`.claude/skills/`)

| Skill | What it does |
|-------|-------------|
| `/process-news` | Batch-process unprocessed articles from `news/inbox/raw/`, distill, extract insights, propose framework/QAAP changes |
| `/process-meeting` | Process a client meeting transcript, extract testing needs, cross-reference with research, generate analysis |
| `/scan-feeds` | Scan RSS feeds from `news/feeds.md`, filter for relevance, recommend articles to download |
| `/sync-docs` | Audit and synchronize all README.md and CLAUDE.md files against actual content |
| `/research-gaps` | Find adopted insights not yet materialized in framework/QAAP docs |
| `/promote-patterns` | Find insights that now appear in 2+ sources and should become patterns |
| `/research-competitor` | Deep-research a competitor tool, produce structured comparison against our principles |
| `/research-status` | Read-only dashboard: article counts, insight/pattern coverage, materialization ratios |

## QAAP Development

For QAAP build/dev commands, see [`qaap/CLAUDE.md`](qaap/CLAUDE.md). Key facts:

- Frontend: React 19 + Vite 8 + MUI v9 + TanStack Router/Query (`qaap/spa/`)
- Backend: Supabase Edge Functions (Deno) (`qaap/backend/`)
- Database: PostgreSQL with RLS (multi-tenant via tenant_id)
- Auth: Supabase Auth (Google OAuth)
- LLM: OpenAI-compatible API — no provider SDK lock-in
- Every LLM call logged to `prompt_logs` table (non-negotiable NFR)
