---
name: scan-feeds
description: Scan RSS feeds from `news/feeds.md`, fetch recent titles, filter for relevance to the framework/QAAP, and recommend which articles to download. Use when the user says "escanea feeds", "scan feeds", "qué hay nuevo", or invokes `/scan-feeds`.
---

# scan-feeds — discover new articles from RSS sources

## When to invoke

User says any of:
- "escanea feeds", "scan feeds"
- "qué hay nuevo", "what's new"
- "revisa los RSS"
- `/scan-feeds`

## Step 1: Load feed list

Read `news/feeds.md`. Extract all feed URLs marked as ✅ (verified).

Priority order:
1. Top 3 (Medium tag feeds: ai-testing, llm-testing, test-automation)
2. Industry blogs (Ministry of Testing, BrowserStack, Applitools, etc.)

## Step 2: Fetch each feed

Use WebFetch to get each feed URL. Parse the XML for recent entries (last 2 weeks by default).

For each entry extract:
- Title
- Author
- Date
- URL
- Excerpt/summary (if available in the feed)

## Step 3: Deduplicate against existing articles

Read the index table in `news/README.md`. Filter out any article that:
- Has the same title (fuzzy match — titles may differ slightly between RSS and processed version)
- Has the same URL
- Has the same author + similar date (within 3 days)

## Step 4: Score relevance

For each remaining (new) article, score relevance 1-5 based on:

**High relevance (4-5):**
- Mentions: Playwright, Cypress, Karate, E2E test generation, MCP, Claude/LLM + testing
- Topics: test automation with AI, LLM eval frameworks, failure analysis, self-healing tests
- Appears to describe a real implementation (not just opinion/theory)

**Medium relevance (3):**
- General AI/LLM testing discussion
- Tool comparisons or reviews
- Conference talks or roundups

**Low relevance (1-2):**
- Marketing content / product launches
- Unrelated to QA (pure ML, pure DevOps without testing angle)
- Duplicates of topics already well-covered in our research

## Step 5: Present curated list

Output a table sorted by relevance (highest first):

```
## Artículos nuevos encontrados: N

| Relevancia | Título | Autor | Fecha | Feed | Acción |
|------------|--------|-------|-------|------|--------|
| ⭐⭐⭐⭐⭐ | ... | ... | ... | Medium ai-testing | Descargar |
| ⭐⭐⭐ | ... | ... | ... | BrowserStack | Revisar título |
| ⭐ | ... | ... | ... | Ministry of Testing | Skip |
```

For articles scored ≥ 4: suggest the user download them (MarkDownload or friend link) and drop in `news/inbox/raw/`.

For articles scored ≤ 2: mark as skip with one-line reason.

## Step 6: Report feed health

Note any feeds that failed to fetch (timeout, 404, invalid XML) and suggest updating `feeds.md`.

## Limitations

- Medium tag feeds only return title + excerpt (~20-30 words), not the full article body
- Member-only articles behind paywall can't be read — the user must download them manually
- Feed content may be cached; very recent articles (< 1 hour) may not appear
