# Research

Consolidated findings from processed articles, competitor analysis, and client engagements. This is the single source of truth that feeds all design decisions in `qa-framework/` and `qaap/`.

## Files

| File | What it contains |
|------|-----------------|
| [insights.md](insights.md) | Key findings with decision/action, cited by ADRs. Each entry has: title, origin, what, why it matters, decision/action, materialized in. |
| [patterns.md](patterns.md) | Recurring patterns that appear in 2+ independent sources. Stronger signal than a single insight. |
| [client-signals.md](client-signals.md) | Sanitized, aggregated market signals from NFQ client engagements. No client names or identifying details (raw transcripts are gitignored in `clients/`). |

## How research flows into products

```
news/ + references/  -->  insights.md   -->  qa-framework/ ADRs + specs
                          patterns.md
clients/ (local)     -->  client-signals.md
```

Every design decision must trace back to an entry here. If something also has backing from client signals, that is a strong signal. Without a research trace, the decision does not go into the framework.

## Promotion rules

- An insight requires 1 source to be recorded.
- A pattern requires 2+ independent sources. Use `/promote-patterns` to scan for promotable insights.
- A client signal requires sanitization (no names, no identifying details) before it enters `client-signals.md`.
