export type ReviewStatus = "pending" | "approved" | "rejected" | "modified";

export interface ProposalScenario {
  id: string;
  title: string;
  gherkin_text: string;
  confidence: number;
  rationale: string;
  source_model: string;
  review_status: ReviewStatus;
  sort_order: number;
  context_refs: string[];
}

export interface ProposalTestArea {
  id: string;
  name: string;
  description: string;
  confidence: number;
  rationale: string;
  background: string;
  scenarios: ProposalScenario[];
}

export interface ProposalTestPlan {
  id: string;
  name: string;
  description: string;
  modality: string;
  target_framework: string;
  confidence: number;
  rationale: string;
  context_sources: {
    source_type: string;
    config: Record<string, unknown>;
  }[];
  test_areas: ProposalTestArea[];
}

export interface CoverageGap {
  description: string;
  sources_present: string[];
  sources_missing: string[];
}

export interface ProposalStats {
  total_test_plans: number;
  total_test_areas: number;
  total_scenarios: number;
  avg_scenario_confidence: number;
}

export interface Proposal {
  test_plans: ProposalTestPlan[];
  coverage_gaps: CoverageGap[];
  stats: ProposalStats;
}

export interface ScenarioOverride {
  title?: string;
  gherkin_text?: string;
  review_status?: ReviewStatus;
}

export interface ReviewSelection {
  planId: string | null;
  areaId: string | null;
  scenarioId: string | null;
}

export interface ReviewState {
  proposal: Proposal | null;
  selection: ReviewSelection;
  overrides: Map<string, ScenarioOverride>;
  expanded: Record<string, boolean>;
}

export interface AcceptProposalResponse {
  testPlanIds: string[];
  totalScenarios: number;
}
