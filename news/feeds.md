# RSS Feeds — Verified Sources

Feeds **verified** (return valid XML as of 2026-06-01). When one stops responding,
mark it as ❌ and find a replacement.

## ⭐ Top 3 (our primary interest)

Medium tag feeds aggregate **everyone** publishing with that tag —
the most efficient way to cover the ecosystem without following authors one by one.

| Feed | URL | Why |
|---|---|---|
| Medium · `ai-testing` | https://medium.com/feed/tag/ai-testing | Core of what we want to track |
| Medium · `llm-testing` | https://medium.com/feed/tag/llm-testing | LLM-specific |
| Medium · `test-automation` | https://medium.com/feed/tag/test-automation | General state-of-the-art coverage |

> ⚠️ **Medium feed limitation:** only returns title + ~20-30 word excerpt. The article body is NOT in the feed and member-only posts remain behind the paywall. The feed is for **discovering** what's being published; to **read** the full article, see [`paywall-workflow.md`](paywall-workflow.md).

## Industry / Company Blogs

| Feed | URL | Status | Focus |
|---|---|---|---|
| Ministry of Testing (aggregator) | https://feeds.feedburner.com/mottestingfeeds | ✅ | Community QA aggregator — high volume, mixes Medium/Substack/blogs |
| BrowserStack Blog | https://www.browserstack.com/blog/feed/ | ✅ | Lots of AI testing content in 2026 (State of AI in Testing report, Breakpoint) |
| Applitools Blog | https://applitools.com/blog/feed/ | ✅ | Visual AI testing, autonomous testing |
| Qualitest | https://www.qualitestgroup.com/feed/ | ✅ | QA consultancy — GenAI in banking, enterprise cases |
| Thoughtworks Insights | https://www.thoughtworks.com/rss/insights.xml | ✅ | Agentic systems, AI engineering — not pure QA but relevant context |

## Pending Candidates (unverified — no public RSS found)

These blogs are relevant but **don't expose RSS** (or the URL changed). To follow them,
use another method (newsletter / manual scrape / search on feedspot).

- **TestGuild** (`testguild.com`) — its `/feed/` returns 404 as of today
- **Confident AI** (`confident-ai.com/blog`) — no public RSS
- **Langfuse blog** — no public RSS
- **Playwright blog** — no public RSS
- **Anthropic news** — no public RSS
- **Cypress blog** — `blog.cypress.io` redirected and broke the feed

## How we use this

1. **Ad-hoc reading:** pass the feed URL and review recent headlines with `WebFetch`.
2. **Periodic curation:** every X days review Top 3 + industry blogs, send items worth analyzing to `news/inbox/`.
3. **Filtering:** not everything in `ai-testing` or `llm-testing` is useful — much of it is marketing. Curation is the real work.

## How to add a new feed

1. Verify the URL returns XML (test with `WebFetch` before adding).
2. Add a row in the corresponding table with ✅ status.
3. If it stops working, move to "Pending Candidates" with the failure note.
