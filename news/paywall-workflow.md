# Workflow for Paywalled Articles (Medium and similar)

The assistant **cannot authenticate** with your Medium account. RSS only returns
titles + excerpts. For the full body of a member-only post, you need to transfer
the content from your logged-in session to a location the assistant can read.

## Options, best to worst

### A. Save-as-markdown (recommended) ⭐

1. Install [MarkDownload](https://github.com/deathau/markdownload) in your browser (Chrome/Firefox/Edge).
2. Open the post in Medium (logged in, no paywall).
3. Right-click → "Download Tab as Markdown".
4. Save the `.md` to `news/inbox/raw/` (MarkDownload may also create a sibling folder with images — leave it, it gets cleaned up).
5. When you have several accumulated, say: **"process the inbox"** and the assistant will:
   - Read each `.md`.
   - Create a structured summary at `news/inbox/YYYY-MM-DD-slug.md`.
   - Register the entry in the `news/README.md` index.
   - Move the raw file to `news/inbox/raw/processed/`.
   - **Delete the sibling image folder** (not used in summaries).

### B. Friend link (for a single urgent article)

Medium lets members generate a "friend link" that bypasses the paywall:

1. On the post → Share button → "Generate Friend Link" (or "Send a story").
2. Pass that URL in the chat.
3. The assistant opens it with `WebFetch` directly.

### C. Copy-paste (quickest, one-off)

Open the post, ⌘A + ⌘C, paste in the chat. Processed on the fly.

### D. Print to PDF

If you don't want to install anything:

1. Print → Save as PDF in the logged-in browser.
2. Save to `news/inbox/raw/`.
3. The assistant reads the PDF (less clean format than markdown, but works).

## Structure of `news/inbox/`

```
news/inbox/
├── raw/                     # ← you drop downloaded .md/.pdf here
│   └── processed/           # ← already-processed files are moved here
└── YYYY-MM-DD-slug.md       # ← structured summaries
```

## What does NOT work

- Passing your Medium credentials: the assistant does not authenticate with your account.
- Passing your session cookies: `WebFetch` does not support custom headers.
- Asking to "read your saved list": that list is private and requires login.
