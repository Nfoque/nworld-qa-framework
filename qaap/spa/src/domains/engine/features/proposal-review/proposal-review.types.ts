export type ReviewStatus = "pending" | "approved" | "rejected" | "modified";

export interface SourceRef {
  chunk_id: string;
  source: string;
  type: string;
}

export interface ProposalScenario {
  id: string;
  name: string;
  description: string;
  gherkin: string;
  confidence: number;
  rationale: string;
  test_area_id: string;
  source_refs: SourceRef[];
}

export interface ProposalTestArea {
  id: string;
  compound_id: string;
  name: string;
  description: string;
  confidence: number;
  background: string;
  scenario_count: number;
  scenarios: ProposalScenario[];
}

export interface ProposalFeature {
  id: string;
  name: string;
  description: string;
  confidence: number;
  test_area_count: number;
  scenario_count: number;
  test_areas: ProposalTestArea[];
}

export interface CoverageGap {
  description: string;
  sources_present: string[];
  sources_missing: string[];
}

export interface DetectedGap {
  area: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface ProposalSummary {
  features: number;
  test_areas: number;
  scenarios: number;
  raw_chunks: number;
  confidence: {
    features_avg: number;
    test_areas_avg: number;
    scenarios_avg: number;
    scenarios_median: number;
  };
  coverage_gaps: CoverageGap[];
}

export interface Proposal {
  features: ProposalFeature[];
  coverage_gaps: CoverageGap[];
  detected_gaps: DetectedGap[];
  summary: ProposalSummary;
}

export interface ScenarioOverride {
  name?: string;
  description?: string;
  rationale?: string;
  gherkin?: string;
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
