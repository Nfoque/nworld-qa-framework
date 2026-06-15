import type {
  Proposal,
  ProposalScenario,
  ProposalTestArea,
  ProposalTestPlan,
  ReviewState,
  ReviewStatus,
  ScenarioOverride,
} from "./proposal-review.types";

import type { EngineJobStep } from "@/domains/engine/features/engine-run/engine-run.types";

export function extractProposal(
  steps: EngineJobStep[],
): Proposal | null {
  const proposalStep = steps.find(
    (s) => s.stepType === "generate_proposal" && s.status === "completed",
  );
  const raw = (proposalStep?.output as { proposal?: Proposal } | undefined)
    ?.proposal;
  if (!raw) return null;

  return {
    test_plans: raw.test_plans ?? [],
    coverage_gaps: raw.coverage_gaps ?? [],
    stats: raw.stats ?? {
      total_test_plans: 0,
      total_test_areas: 0,
      total_scenarios: 0,
      avg_scenario_confidence: 0,
    },
  };
}

export function getConfidenceColor(
  confidence: number,
): "success" | "warning" | "error" {
  if (confidence >= 0.85) return "success";
  if (confidence >= 0.6) return "warning";
  return "error";
}

export function getConfidenceHex(confidence: number): string {
  if (confidence >= 0.85) return "#2e7d32";
  if (confidence >= 0.6) return "#ed6c02";
  return "#d32f2f";
}

export function getEffectiveScenario(
  scenario: ProposalScenario,
  overrides: Map<string, ScenarioOverride>,
): ProposalScenario {
  const override = overrides.get(scenario.id);
  if (!override) return scenario;
  return { ...scenario, ...override };
}

export function getEffectiveStatus(
  scenario: ProposalScenario,
  overrides: Map<string, ScenarioOverride>,
): ReviewStatus {
  return overrides.get(scenario.id)?.review_status ?? scenario.review_status;
}

export function computeReviewStats(state: ReviewState) {
  if (!state.proposal) {
    return { approved: 0, rejected: 0, pending: 0, modified: 0, total: 0 };
  }

  let approved = 0;
  let rejected = 0;
  let pending = 0;
  let modified = 0;

  for (const plan of state.proposal.test_plans) {
    for (const area of plan.test_areas) {
      for (const scenario of area.scenarios) {
        const status = getEffectiveStatus(scenario, state.overrides);
        if (status === "approved") approved++;
        else if (status === "rejected") rejected++;
        else if (status === "modified") modified++;
        else pending++;
      }
    }
  }

  return {
    approved,
    rejected,
    pending,
    modified,
    total: approved + rejected + pending + modified,
  };
}

export function buildAcceptPayload(
  proposal: Proposal,
  overrides: Map<string, ScenarioOverride>,
): Proposal {
  return {
    ...proposal,
    test_plans: proposal.test_plans.map((plan) => ({
      ...plan,
      test_areas: plan.test_areas.map((area) => ({
        ...area,
        scenarios: area.scenarios.map((s) => ({
          ...s,
          ...overrides.get(s.id),
        })),
      })),
    })),
  };
}

export function getSelectedScenario(
  proposal: Proposal,
  selection: { planId: string | null; areaId: string | null; scenarioId: string | null },
): ProposalScenario | null {
  if (!selection.planId || !selection.areaId || !selection.scenarioId)
    return null;
  const plan = proposal.test_plans.find((p) => p.id === selection.planId);
  if (!plan) return null;
  const area = plan.test_areas.find((a) => a.id === selection.areaId);
  if (!area) return null;
  return area.scenarios.find((s) => s.id === selection.scenarioId) ?? null;
}

const STORAGE_PREFIX = "qaap:review-overrides:";

export function saveOverrides(
  jobId: string,
  overrides: Map<string, ScenarioOverride>,
): void {
  try {
    const serialized = JSON.stringify(Array.from(overrides.entries()));
    localStorage.setItem(`${STORAGE_PREFIX}${jobId}`, serialized);
  } catch {
    // quota exceeded or private browsing — silently skip
  }
}

export function loadOverrides(
  jobId: string,
): Map<string, ScenarioOverride> | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${jobId}`);
    if (!raw) return null;
    const entries: [string, ScenarioOverride][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return null;
  }
}

export function clearOverrides(jobId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${jobId}`);
}

export function countScenariosInPlan(plan: ProposalTestPlan): number {
  return plan.test_areas.reduce((sum, a) => sum + a.scenarios.length, 0);
}

export function getSelectedArea(
  proposal: Proposal,
  selection: { planId: string | null; areaId: string | null },
): ProposalTestArea | null {
  if (!selection.planId || !selection.areaId) return null;
  const plan = proposal.test_plans.find((p) => p.id === selection.planId);
  if (!plan) return null;
  return plan.test_areas.find((a) => a.id === selection.areaId) ?? null;
}
