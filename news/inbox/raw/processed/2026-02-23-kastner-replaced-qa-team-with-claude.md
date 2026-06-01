# I replaced my entire QA team with Claude and Agentic Workflow

[

![Brent Kastner](https://miro.medium.com/v2/resize:fill:32:32/2*lJsws9RCyM14N7pYMjKSzA.jpeg)





](https://medium.com/@brentkastner?source=post_page---byline--aed22dfb2a65---------------------------------------)

[Brent Kastner](https://medium.com/@brentkastner?source=post_page---byline--aed22dfb2a65---------------------------------------)

Follow

8 min read

·

Feb 23, 2026

221

5

Listen

Share

More

_An Open-Source Experiment with Claude, Python, and Playwright_

## Why Determinism Matters

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*yjjotfF4UGz19-TmgO-7lg.png)

TLDR; Fully autonomous open source QA automation tool available at: [github.com/brentkastner/ai-qa-framework](https://github.com/brentkastner/ai-qa-framework)

Can an agent LLM act as a fully functional team of QA automation engineers with minimal human input? I’m talking about fully autonomous exploration, coverage mapping, weighting, planning, execution, assertions, and a memory for tracking regressions. It’s an ambitious idea, and I wanted to test whether we’re on the cusp of this kind of breakthrough or whether we still have meaningful ground to cover. With that in mind, let’s get to work.

The goal: a system that takes very little human input. A URL, some credentials if there’s a login step, and a few hints to give the LLM some guidance. From those sparse details, the system should inspect the application and determine on its own what to test and why. That test plan would then be handed to a test runner, in this case Playwright, to step through each test, gather evidence, make determinations, and report on its findings.

We did a fairly big thing based on a fairly big idea, and I want to share it with you, warts and all. We’ve decided to open source this so that others can learn and build on what we’re doing in this space. You can find the project at [github.com/brentkastner/ai-qa-framework](https://github.com/brentkastner/ai-qa-framework). Python and Anthropic’s Claude Opus 4.6 are the necessary tools.

## Why Determinism Matters

Working on this project has solidified my thinking about the relationship between software and the people who use it. Human beings demand predictability in most things, but especially the things that are important. When I log into my bank to move money from checking to savings, I want to follow the exact same sequence of steps every single time. I don’t want to take a new path each visit, even if it leads to the same result, because that feels exhausting and unpredictable. The same principle applies to building software. Every application has critical functionality or tasks that are key to its usefulness and that simply need to work, and work well, every time the software is modified.

For the better part of 20 years, software developers have defined and refined techniques to build predictability into their craft: unit tests, integration tests, and front-end testing, both automated and manual. This process is far from perfect, but the software I write today, informed by those two decades of practice, is far better, less buggy, and more predictable than ever before.

## The Tension: Non-Determinism Meets Deterministic Expectations

LLMs are by definition non-deterministic. You can ask an LLM the same question in separate contexts multiple times and you will not get exactly the same answer. You’ll get a statisticaly similar answer with similar elements, but it most likely won’t be identical. This is neither good nor bad, it’s just how the math works. It’s completely fine for many applications, but people demand consistency from the systems they depend on.

This raises a question: can a fundamentally non-deterministic system play a meaningful role in a world where determinism is required? My answer is nuanced. I don’t think we’re anywhere close to trusting an LLM-driven system to autonomously “just go test” a production application and gate a release pipeline.

The distinction I kept coming back to is between **regression testing** and **exploratory testing**. Regression testing demands determinism: the same tests, the same assertions, the same pass/fail criteria, run after run. Exploratory testing is intentionally non-deterministic — a skilled tester probing an application from different angles, looking for things that a fixed test suite might miss. At the end of the day though I haven’t worked on a single product team that has prioritized random exploratory testing as a major priority. Product teams almost always have significant backlogs of core or important flows they are aiming to automate. The benefits seem thin if this is the best we can get out of existing models but I’m willing to keep working out the details. More on this later.

## The Good

## It’s a Little Magical

Install the dependencies, make a few changes to a configuration file, grab an Anthropic API key, and run a Python command. The system begins to crawl the target site and gather links, relations, CTA elements — all the things you’d expect to interact with during testing. From there, it generates a test plan, executes it, and produces results with minimal human involvement. The experience of watching it work for the first time is genuinely compelling.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*-Sli5KdunC886QH4qjiUGw.png)

## Beautiful Test Reports

For every test the LLM generates, Playwright captures each step along with its condition and evidence to support the pass or fail determination. The resulting reports are detailed and visually clear, making it easy to review what happened and why.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*xQvZ7Yjyj4Qds4tRkDM67A.png)

## Blended Testing Types

As a configuration option, the model can be instructed to focus on different types of testing — functional, visual, light security — and blend them into a single run. This is useful for casting a wide net in early exploration, then drilling deeper into specific areas on subsequent runs.

## AI Fallback

If Playwright is unable to match a specific selector or assertion, the framework escalates to an AI evaluation using the LLM. This works surprisingly well. When a traditional assertion can’t locate the element it expects, the LLM can look at the page state and make a judgment call. There may be a broader idea here worth exploring in future iterations.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*G5XgaKjq_NLJqz380EVa2A.png)

## Full Prompt Inspection

When the system runs, it captures all prompts and responses in the .qa-framework directory. This is invaluable for understanding what the prompts are doing, how the LLM is interpreting them, and where things go sideways. Transparency like this matters when you’re building on top of a system you can’t fully predict.

## The Bad and Frustrating

## Flakiness and Lack of Robustness

Even with ample hints injected into the process, the LLM introduces a certain level of randomness in the types of tests it selects. I have yet to have a fully autonomous run where 100% of the tests make sense and are appropriate. Some drift is acceptable in exploratory testing, but in the context of a CI/CD release pipeline, flakiness is a design-level problem. Avoiding false positives and irrelevant tests is essential for any system that gates deployments, and I contend LLMs aren’t quite there yet in autonomous mode.

## Does it work?

Kind of. Sort of. It’s almost all the way there. To be clear I am not talking about the python shim we’ve created here (the agent). I’m referring to the output of the model directing the agent to do the testing. It kind of works but it doesn’t work well enough for me to trust it fully. Exploratory testing isn’t sufficient on its own development teams need a suite of tests that relate to the context and protect the core flows every time. I like the idea of taking the output of exploratory tests and making a regression flow from it. Perhaps we can develop a way to describe a core flow in plain english and have this tool ultimately make a set of tests out of it. That might be worthwhile.

I find this hard to explain to non-technical friends, but I’ll give it a shot. Have you seen an AI video on Instagram or TikTok? It’s almost so real but not quite in some indescribable way. It’s the same feeling with software.

![](https://miro.medium.com/v2/resize:fit:144/1*JSyf0MPOPCGdvrSlxsnkeg.png)

## Speed

It takes Opus 4.6 roughly 300 seconds (five minutes) to generate a test plan of 50 tests complete with steps and assertion criteria. For context, that’s fast compared to a human writing those same tests from scratch. But it’s slow compared to executing an already-written test suite in a pipeline. The comparison matters: this tool is better suited for test generation and exploratory runs than for pipeline-integrated regression testing, at least in its current form.

## What’s Next

Work clearly needs to be done to make the output more predictable, and I believe the path forward is a hybrid approach rather than a purely autonomous one. The model I keep coming back to: a human reviews the tests from each run and flags the ones that should be persistent, saving them to a deterministic suite that runs identically every time. In this way, the LLM handles exploration and discovery while humans curate the authoritative test suite. The AI adds incremental value; the humans provide context and judgment.

There are also practical additions that would be needed for real-world adoption: data creation, setup and teardown tasks, integrations with tools like Jira and Notion. None of these seem like fundamental barriers as they’re engineering work, and I don’t see any reason they wouldn’t be achievable over time.

## Conclusion

Thank you for reading this far. With so much in the news about the impact of AI on our jobs and lives, I wanted to take stock of where things actually stand rather than where people imagine they’re heading.

The vast majority of this tool was built in Claude Code with Opus 4.6 as the model. Was it useful? Absolutely, without question. But I still found myself drawing on years of software development experience to guide the model down the right path, and often to flat-out reject changes it introduced. The places where my judgment was most needed were architectural decisions, enforcing consistent patterns across the codebase, knowing which test patterns would be meaningful versus superficial, and recognizing when the model was confidently producing slop that runs counter to the patterns in the rest of the code. Those are exactly the kinds of decisions that come from experience and knowledge of a codebase, not from pattern matching on training data.

Would this project, even in a more polished state, replace a qualified automation engineer or developer? I don’t see how it could because the value of a good engineer lies in the judgment calls the model still can’t reliably make. What it can do is make that engineer more productive, and that could be a meaningful outcome.

Fully autonomous code generation without guidance is still not reliable for work of any real importance. If you don’t believe me, inspect the unit tests in this project; I left them as-is on purpose.

All of that said, I genuinely enjoyed doing the research that ultimately led to the creation of this tool and working through these important questions and ideas. If any of this resonates with you, I’d love to hear from you.

Regarding the QA team I replaced… They are all rejoining the team on Monday.

**Technical Note:** This framework requires Claude Opus 4.6. Earlier Claude models (including the Sonnet family) produce inconsistent API responses when asked to return structured JSON in a specific format, which breaks the framework regularly. Opus 4.6 has meaningfully improved reliability on this front.