# Client signals — what clients are asking for (cross-client, sanitized)

Sanitized synthesis of testing needs observed in client meetings.
Original data lives in `clients/` (gitignored, local-only). Only the
aggregated pattern goes here, without names or details that identify the client.

This is **the other half** of the input to framework prioritization:

- `research/insights.md` and `research/patterns.md` = what the ecosystem says (literature, public postmortems).
- `research/client-signals.md` (this file) = what the real market says (NFQ engagements).

When the same need appears in ≥ 2 independent clients, it rises here and
becomes a **roadmap signal** for `qa-framework/`.

## Format

```
### [Need]
- **Appearances:** N clients (industry / project type, no names)
- **Description:** what they ask for — phrased generically
- **Current framework coverage:** ✅ / ⚠️ / ❌
- **Research anchor:** traced to `research/insights.md#...` if applicable
- **Action:** add to prioritization / monitor / no change
```

---

## Note on current state

The signals below are **provisional**. They come from a single client with 3 parallel engagements in different enterprise SaaS domains (HR core, IT service mgmt, payroll). The file's rule requires ≥ 2 independent clients for a pattern to be considered a "firm roadmap signal". These signals are hypotheses to confirm when meetings with the next client arrive.

Marked with `[1c-3e]` = observed in 1 client / 3 engagements (intra-client).

---

### Vendor-without-access-to-client-tooling

- **Appearances:** `[1c-3e]` (2 of 3 engagements from one enterprise SaaS account: HR core + payroll)
- **Description:** The client simultaneously contracts the **SaaS implementer** (product consultancy) and the **testing vendor**. The testing vendor operates within the client's tooling (Jira, etc.). The implementers **do not have access to that tooling** and it is not feasible to get it for them on short timelines. Result: the defect / test-case flow breaks at the external vendor boundary. Typical workaround: build a Jira Form so that external parties can create defects without full access.
- **Current framework coverage:** ❌ — this is an operational / privilege management problem, not LLM-driven QA.
- **Research anchor:** —
- **Action:** monitor. If it appears in another client, consider whether there is value in automating the defect-form ↔ Jira bridge (but it probably remains out of scope for the current framework).

---

### Regression suite as "acknowledged gap, never built"

- **Appearances:** `[1c-3e]` (all 3 engagements). In the client's own words: *"testing is a big gap, has always been"*, *"we just test the change usually, no regression"*, *"we hope nothing breaks, find out when in production"*.
- **Description:** Client teams explicitly acknowledge that the regression suite is a foundational gap. The only "decent" regression exists for platform upgrades 1-2x/year. Sprint-level regression does not exist. Each change is validated only against the specific change, without verifying that previously working functionality still works.
- **Current framework coverage:** ⚠️ Partial — the framework distinguishes "regression vs exploratory" as a design criterion, but the content is oriented toward LLMs (eval frameworks). The gap here is enterprise SaaS regression suite construction — a different domain.
- **Research anchor:** `research/insights.md#regression-vs-exploratory-como-criterio-de-diseño`, `research/patterns.md#golden-dataset-/-ground-truth-como-inversión-obligatoria` (the idea that "dataset construction is first-class work").
- **Action:** add to framework prioritization: **if there is an enterprise-SaaS version of the framework, regression-from-zero is the most demanded module**. Consider a "regression seed → growth" pattern analogous to the living dataset but for enterprise test cases.

---

### Pipeline gating as an unimplemented aspiration

- **Appearances:** `[1c-3e]` (2 of 3 engagements: a security SaaS platform + a payroll module). The client *wants* to block deploys on test failures but has not invested in the tooling.
- **Description:** The client team discusses integrating tests into the pipeline to block deploys on failure. In all cases: "it's a good idea, it's not trivial to implement in our current stack". The current stack (e.g., SaaS-specific deployment tools) does not expose clean hooks for gating, or the testing vendor does not have access to the client's CI/CD.
- **Current framework coverage:** ✅ Conceptually aligned — the "Build-time vs run-time separation" pattern in the framework says exactly this: what assists QA during design should not be in the CI execution path, and what is deterministic should block the pipeline.
- **Research anchor:** `research/patterns.md#build-time-vs-run-time-separation`.
- **Action:** monitor. If this is confirmed with other clients, the framework could position its contribution as *"the run-time side of the split"* — a deterministic runner that plugs into the client's pipeline. Useful for differentiating from a pure "LLM exploration" positioning.

---

### Test evidence as Word/screenshot/Sheets in a secondary system

- **Appearances:** `[1c-3e]` (all 3 engagements, each with a different tool: Jira comments + attached screenshots, Word docs in the client's file storage, ad hoc Google Sheets).
- **Description:** "Test evidence capture" does exist in all 3 cases, but it is never structured. Each engagement reinvents a different format (screenshot pasted in ticket, doc attached to deployment tool, manual sheet). Result: evidence is not traceable, not queryable, not reusable for building a regression suite.
- **Current framework coverage:** ❌ — this is a test management / structured artifacts problem.
- **Research anchor:** —
- **Action:** monitor. The framework opportunity would be a **mandatory schema for test execution artifacts** (rationale + screenshot + ID + version + result), analogous to the "mandatory schema for LLM outputs" already captured in `research/patterns.md#confidence-+-cita-como-formato-de-output-llm`. Same philosophy, different domain.

---

### Cross-functional / integration impact testing as a foundational gap

- **Appearances:** `[1c-3e]` (all 3 engagements). Observed cases: a platform touching multiple areas (HR, IT service mgmt, asset mgmt, compliance); a daily sync between two critical SaaS systems (HR → payroll); a migration to SaaS-recruitment with 2 external plugins.
- **Description:** The SaaS or its integrations touch multiple modules / systems / functional areas. No documented dependency matrix. A change in one module can break another without warning. The client team does not systematically test cross-functional impact.
- **Current framework coverage:** ❌ Conceptually out of scope — the framework addresses properties of individual LLM outputs, not dependency-graph testing.
- **Research anchor:** —
- **Action:** monitor. If this repeats, possible framework extension toward **impact analysis** (which tests to run when module X changes) — but it would probably be built with static analysis of the SaaS schema/config, not with LLM. Possible LLM wedge: classify PRs by impact area and suggest test suites to run (analogous to "Coverage gap analysis as PR linter" but inverted).

---

### Test case inheritance from outgoing vendor

- **Appearances:** `[1c-3e]` (2 of 3 engagements: outgoing vendor left test cases in one; in the other the sole knowledge holder is leaving the project and bus factor = 1).
- **Description:** When a vendor exits the engagement, they leave a baseline of test cases (from UAT of a closed project, or from hand-built manual configuration). The new vendor (NFQ) inherits them. Problem: these artifacts were designed as **one-shot** (UAT for go-live of the closed project), not as **continuous regression**. They need to be cataloged, deduplicated, and reinterpreted as a seed for the regression suite — not applied as-is.
- **Current framework coverage:** ⚠️ Partial — the "Living dataset (promotion-from-incident)" pattern has the same shape but applied to production failures, not vendor inheritance. The idea that "the dataset is an accumulated result, not an initial artifact" translates well here: convert the inherited baseline into a seed, not into truth.
- **Research anchor:** `research/patterns.md#living-dataset-promotion-from-incident`.
- **Action:** add note to `research/patterns.md` about **another source for the living dataset: vendor-handover baseline**, not only production incidents.

---

### Test management tooling decision with multiple simultaneous candidates

- **Appearances:** `[1c-3e]` (all 3 engagements). Observed combinations: SaaS-native ATF vs internal side project vs new vendor's tool; Jira+X-Ray vs legacy Google Sheets; Jira+Word-attachments vs something structured to be proposed.
- **Description:** The client is in the middle of deciding their test management stack — multiple candidate tools in parallel, some native to the SaaS (ATF), some built internally (side project), some proposed by the new vendor. The new vendor enters as a participant in the decision, not as an adopter.
- **Current framework coverage:** ⚠️ — conceptual parallel with "OpenAI-compatible API as portability layer": do not couple to a single provider. The lesson here: the framework should offer **an abstraction layer over test management tooling**, not a binding to a specific Jira or X-Ray.
- **Research anchor:** `research/insights.md#openai-compatible-api-como-capa-de-portabilidad`.
- **Action:** add to prioritization: **framework NF constraint #2: test management agnostic**. If the framework generates/consumes test cases, it must be able to do so against Jira+X-Ray, Azure DevOps, TestRail, or ad hoc sheets.

---

### Access to SaaS systems as an operational blocker for vendor onboarding

- **Appearances:** `[1c-3e]` (2 of 3 engagements: payroll SaaS where "existing roles are too broad"; HR SaaS where testers require "business roles" provisioned by a specific team via Jira tickets).
- **Description:** The new testing vendor needs a specific role for testers in the client's SaaS. Existing roles are either too broad (admin/dev → excess privileges + compliance restrictions) or too restrictive (business user → cannot test). A **new "tester" role** must be created via the client's authorization team. This operationally blocks the first weeks of the engagement.
- **Current framework coverage:** ❌ Operational, out of scope.
- **Research anchor:** —
- **Action:** no change in framework. Useful as **input to the NFQ engagement onboarding playbook** — anticipate this blocker in the first meeting.
