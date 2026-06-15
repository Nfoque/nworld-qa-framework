# qaap-engine — Roadmap

> Live backlog lives in **dwork** under the `qaap` project. This file is a stable high-level summary.

## Done

- ✅ Autonomous 5-step pipeline design + step state machine (`engine_jobs` / `engine_job_steps`).
- ✅ Migration `0013_engine_job_steps` + simplified job/step statuses.
- ✅ Edge Functions `get-engine-job` / `list-engine-jobs` return `steps[]`.
- ✅ SPA engine-run viewer: step-based timeline, JSON viewer modal, proposal summary, review CTA.
- ✅ SPA pipeline-list: queued/running filters, active-step label, review CTA.
- ✅ Manual end-to-end simulation against `ivncmp/clau-lessons` (12 TestPlans / 26 scenarios).
- ✅ [`PIPELINE-EXECUTION-REFERENCE.md`](PIPELINE-EXECUTION-REFERENCE.md) — the build spec.

## Next

1. **Process the waveconomy job** (`1bb29af2…`) end-to-end with the same pipeline — a second functional dataset.
2. **Ultra-realistic step-by-step simulation** — a runner that advances the pipeline automatically, watched live in the SPA.
3. **Proposal review page** (`/engine/:jobId/review`) — browse/edit/approve → materialize into `test_plans` + `test_scenarios`. Validate with clau-lessons + waveconomy.
4. **qaap-engine** — the real standalone Node worker driven by processing queues (Dockerized). This doc's reference is its build spec.
5. **LLM provider integrations in Settings** — multi-LLM model matrix (OpenAI-compatible), as in the prototype.

See dwork (`qaap`) for priorities, estimates, and detailed task docs.
