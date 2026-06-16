import type {
  Proposal,
  ProposalFeature,
  ProposalScenario,
  ProposalTestArea,
  ReviewState,
  ReviewStatus,
  ScenarioOverride,
} from "./proposal-review.types";

import type { EngineJobStep } from "@/domains/engine/features/engine-run/engine-run.types";

export function extractProposal(steps: EngineJobStep[]): Proposal | null {
  const proposalStep = steps.find(
    (s) => s.stepType === "generate_proposal" && s.status === "completed",
  );
  if (!proposalStep?.output) return null;

  const output = proposalStep.output as Record<string, unknown>;
  const features = output.features as ProposalFeature[] | undefined;
  if (!features?.length) return null;

  return {
    features,
    coverage_gaps: (output.coverage_gaps as Proposal["coverage_gaps"]) ?? [],
    detected_gaps: (output.detected_gaps as Proposal["detected_gaps"]) ?? [],
    summary: (output.summary as Proposal["summary"]) ?? {
      features: 0,
      test_areas: 0,
      scenarios: 0,
      raw_chunks: 0,
      confidence: {
        features_avg: 0,
        test_areas_avg: 0,
        scenarios_avg: 0,
        scenarios_median: 0,
      },
      coverage_gaps: [],
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
  return overrides.get(scenario.id)?.review_status ?? "pending";
}

export function computeReviewStats(state: ReviewState) {
  if (!state.proposal) {
    return { approved: 0, rejected: 0, pending: 0, modified: 0, total: 0 };
  }

  let approved = 0;
  let rejected = 0;
  let pending = 0;
  let modified = 0;

  for (const feature of state.proposal.features) {
    for (const area of feature.test_areas) {
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
    features: proposal.features.map((feature) => ({
      ...feature,
      test_areas: feature.test_areas.map((area) => ({
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
  selection: {
    planId: string | null;
    areaId: string | null;
    scenarioId: string | null;
  },
): ProposalScenario | null {
  if (!selection.planId || !selection.areaId || !selection.scenarioId)
    return null;
  const feature = proposal.features.find((p) => p.id === selection.planId);
  if (!feature) return null;
  const area = feature.test_areas.find((a) => a.id === selection.areaId);
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

export function countScenariosInFeature(feature: ProposalFeature): number {
  return feature.test_areas.reduce((sum, a) => sum + a.scenarios.length, 0);
}

export function getSelectedArea(
  proposal: Proposal,
  selection: { planId: string | null; areaId: string | null },
): ProposalTestArea | null {
  if (!selection.planId || !selection.areaId) return null;
  const feature = proposal.features.find((p) => p.id === selection.planId);
  if (!feature) return null;
  return feature.test_areas.find((a) => a.id === selection.areaId) ?? null;
}
