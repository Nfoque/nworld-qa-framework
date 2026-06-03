# nworld-qa-framework — Research workspace

Research and design workspace for **nworld-qa-framework**: a framework for automatic
E2E test generation with Playwright, assisted by LLM.

For the product design (pipeline, principles, ADRs), see
[nworld-qa-framework/README.md](nworld-qa-framework/README.md).

## Organization

```
.
├── research/                    Research synthesis
│   ├── insights.md                 Key findings with decision/action
│   ├── patterns.md                 Recurring patterns across sources
│   └── client-signals.md          Market signals (sanitized)
│
├── news/                        Articles and publications on QA + LLMs
│
├── references/                  External repos studied (code, ADRs, postmortems)
│
├── clients/                     Transcripts and analysis per client (gitignored)
│
└── nworld-qa-framework/        The framework — final product
```

## Research -> product flow

```
news/ + references/  ──►  research/insights.md   ──►  nworld-qa-framework/
                          research/patterns.md
clients/ (gitignored) ──► research/client-signals.md
```

Each design decision in the framework traces back to an entry in `research/`. If it also
has backing from client signals, that is a strong signal. Without a trace, the decision does not go in.

## Conventions

- Each article or repo added includes a brief note in its folder's index README.
- `research/` is consolidated opinion, not just another index.
- `nworld-qa-framework/` is kept clean — only what has already gone through `research/` goes in.
