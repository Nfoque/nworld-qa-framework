# Clients — Meeting Transcripts and Analysis

Folder for organizing **client meeting transcripts** and the distilled analysis
of each engagement. Used to feed two things:

1. **Tactical decisions per project** — what the client needs, what our framework covers today, what's missing.
2. **Framework prioritization** — when the same need appears across multiple clients, it gets promoted to `research/client-signals.md` and becomes a roadmap signal.

## ⚠️ Privacy

The repo `Nfoque/qa-framework` is **public within Nfoque**. For security:

- **All content under `clients/` is gitignored** (except this README).
- Transcripts, per-meeting analyses, and client names are **NOT pushed to the repo**.
- Only *sanitized* (cross-client, no names) content goes to `research/client-signals.md`.

If you create a new client folder, it stays local on your machine. No one else at NFQ sees it.

## Structure per client / project

```
clients/
├── README.md                                ← this file (committable)
└── <client-slug>/                           ← a client
    └── <project-slug>/                      ← a specific engagement / project
        ├── project-state.md                 ← live snapshot (rolling)
        ├── transcripts/
        │   ├── raw/                         ← drop zone — paste Fathom JSON, raw Zoom text, etc.
        │   └── processed/                   ← slim/cleaned versions
        └── meetings/
            └── YYYY-MM-DD-topic.md          ← one file per meeting, structured analysis
```

Slugs in kebab-case (`acme-bank`, `risk-platform-rev2`).

## Meeting processing workflow

1. **You** drop the transcript in `clients/<client>/<project>/transcripts/raw/`:
   - **Fathom:** export JSON or markdown from Fathom, leave it here.
   - **Zoom / Teams / other:** copy-paste the text to a `.txt` or `.md` and leave it here.
2. **You tell the assistant** "process meeting X" (or "process transcripts for client Y").
3. **The assistant** will:
   - If Fathom raw → run through the `rawlie-agentic-tooling:fathom-slim-transcript` skill (installed locally) → slim version to `transcripts/processed/`.
   - If raw text → read directly.
   - Extract **testing needs** from the client (functional / E2E / perf / security / LLM eval / RAG / agentic / etc.).
   - Cross-reference with `research/insights.md` and `research/patterns.md` to map: what in our current framework covers each need?
   - Identify **gaps** = what the client is asking for that our framework doesn't cover yet.
   - Generate `meetings/YYYY-MM-DD-topic.md` with the structured analysis.
   - Update `project-state.md` (rolling engagement state).
4. **If a gap repeats** in another client, promote it (sanitized) to `research/client-signals.md`.

## Per-meeting template (`meetings/YYYY-MM-DD-topic.md`)

```markdown
---
client: <client-slug>
project: <project-slug>
date: YYYY-MM-DD
attendees: [names]
duration_min: 60
source: Fathom / Zoom / Teams / other
status: ✅ analyzed
---

# Meeting: <topic>

## Executive summary (1-3 sentences)

## Testing needs identified

| Type | Literal context from transcript | Volume / urgency |
|---|---|---|
| ... | ... | ... |

## Mapping to current framework

| Need | Coverage | Anchor |
|---|---|---|
| ... | ✅ / ⚠️ / ❌ | `research/insights.md#...` |

## Gaps detected

- **Gap 1:** description — priority: high/medium/low
- ...

## Decisions / agreed next steps

## Relevant quotes
> "..."
```

## `project-state.md` template (rolling snapshot)

```markdown
# <Client> / <Project> — State

## Snapshot
- Start: YYYY-MM-DD
- Last meeting: YYYY-MM-DD
- Status: discovery / design / build / live

## Testing needs (consolidated)

## Coverage by qa-framework
- ✅ Covered
- ⚠️ Partial
- ❌ Gaps

## History
- [YYYY-MM-DD — topic](meetings/YYYY-MM-DD-topic.md)
```
