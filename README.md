# qa-framework — Research workspace

Research and design workspace for two products:

1. **qa-framework** (`qa-framework/`) — Skill-first framework for automatic E2E test generation with Playwright + LLM.
2. **QAAP** (`qaap/`) — Multi-tenant SaaS platform that productizes the framework's pipeline.

For the framework design (pipeline, principles, ADRs), see
[qa-framework/README.md](qa-framework/README.md).
For the SaaS product, see [qaap/README.md](qaap/README.md).

## Organization

```
.
├── research/                    Research synthesis
│   ├── insights.md                 Key findings with decision/action
│   ├── patterns.md                 Recurring patterns across sources
│   └── client-signals.md          Market signals (sanitized)
│
├── news/                        Articles and publications on QA + LLMs (13 processed)
│
├── references/                  External repos studied (code, ADRs, postmortems)
│
├── clients/                     Transcripts and analysis per client (gitignored)
│
├── qa-framework/                The framework — skills, protocol, parsers, ADRs
│
└── qaap/                        The SaaS product
    ├── spa/                        React 19 SPA (Vite + MUI v9)
    ├── backend/                    Supabase Edge Functions + PostgreSQL
    └── documentation/              Product specs, 17 ADRs, scaffolding skills
```

## Research -> product flow

```
news/ + references/  ──►  research/insights.md   ──►  qa-framework/
                          research/patterns.md
clients/ (gitignored) ──► research/client-signals.md
```

Each design decision in the framework traces back to an entry in `research/`. If it also
has backing from client signals, that is a strong signal. Without a trace, the decision does not go in.

## Conventions

- Each article or repo added includes a brief note in its folder's index README.
- `research/` is consolidated opinion, not just another index.
- `qa-framework/` is kept clean — only what has already gone through `research/` goes in.
