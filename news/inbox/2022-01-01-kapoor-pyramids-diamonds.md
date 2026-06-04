---
title: "Testing Automation, What are Pyramids and Diamonds?"
author: Ritesh Kapoor
date: 2022-01-01
url: https://ritesh-kapoor.medium.com/testing-automation-what-are-pyramids-and-diamonds-67494fec7c55
status: ✅ distilled
relevance: ⭐⭐
---

# TL;DR

**Foundational, non-LLM article (Jan 2022)**. Overview of the 3 ways to distribute testing effort: **Pyramid** (Cohn — lots of unit, little E2E), **Inverted pyramid / ice-cream cone** (anti-pattern: lots of manual/E2E), and **Diamond** (weight on integration). It was left in the inbox as a **conceptual anchor** to contrast with "The AI Testing Pyramid Has Been Rewritten" — the baseline that those 2026 articles take as rewritten.

## The three shapes

| Shape | Weight | When | Verdict |
|---|---|---|---|
| **Pyramid** (Cohn, *Succeeding with Agile*) | base unit → integration → E2E (little) → manual (minimal) | healthy default | industry standard |
| **Inverted / ice-cream cone** | lots of E2E+manual, little unit | prototypes / PoC where the suite is disposable | anti-pattern outside of that (expensive, fragile, slow) |
| **Diamond** | weight on **integration**, unit and E2E slimmed down | microservices: testing interaction between services gives more confidence than unit | gaining traction in distributed architectures |

Author's notes:
- In microservices, integration tests "are worth more" than unit — but with **mocks** representing external services, not real services (isolated tests).
- E2E remains expensive to develop and maintain → minimize it (echoes of Google's "Just say no to more E2E tests").
- "There is no right or wrong strategy; it's whatever works for you."

## Why it matters for us (the bridge to 2026)

- The thesis of the 2026 AI-QA articles ("the pyramid has been rewritten") presupposes **this** pyramid as the starting point. Having the baseline explicit prevents accepting the reframe without contrast.
- The **historical vertical axis = cost/speed/isolation** (unit cheap/fast/isolated → E2E expensive/slow/realistic). The open question for the lab: **what is the axis when the layer being tested is an LLM?** It is not execution cost but rather **output determinism** — and there the "shape" stops mapping to test types and starts mapping to **types of evaluated property** (structural / semantic / behavioral), as Kshirsagar already pointed out ([[2026-05-08-kshirsagar-three-pipelines-500-assertions]]).

## What we distilled to `research/`

→ Foundational context, not an actionable pattern:
- Noted in `insights.md` the hypothesis: **"the test pyramid is a cost/isolation axis; for LLMs the relevant axis is output determinism → the shape reorganizes by property type, not by test type."** Connects the 2026 reframe with its 2022 baseline.

## References from the article (useful classics)

- Fowler — [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) · [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- Google Testing Blog — [Just say no to more E2E tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
- Spotify Engineering — [Testing of microservices](https://engineering.atspotify.com/2018/01/11/testing-of-microservices/)
- [Test automation diamond](https://eason.blog/posts/2020/03/test-automation-diamond/)
