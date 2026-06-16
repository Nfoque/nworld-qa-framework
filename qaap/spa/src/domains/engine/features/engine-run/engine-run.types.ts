export type JobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type StepType =
  | "collect"
  | "extract_features"
  | "extract_plans"
  | "extract_scenarios"
  | "generate_proposal";

export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface SelectedSource {
  connector: string;
  items: string[];
}

export interface EngineJobStep {
  id: string;
  position: number;
  stepType: StepType;
  status: StepStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  meta: Record<string, unknown>;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface EngineJob {
  id: string;
  tenantId: string;
  status: JobStatus;
  selectedSources: SelectedSource[];
  createdBy: string;
  createdByName?: string | null;
  createdByAvatar?: string | null;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  steps: EngineJobStep[];
}

export interface ProposalFeatureSummary {
  id: string;
  name: string;
  confidence?: number;
  test_areas?: { scenarios?: unknown[] }[];
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
}

export interface ProposalData {
  features: ProposalFeatureSummary[];
  coverage_gaps?: unknown[];
  detected_gaps?: unknown[];
  summary?: ProposalSummary;
}

export interface PipelineStep {
  stepType: StepType;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { stepType: "collect" },
  { stepType: "extract_features" },
  { stepType: "extract_plans" },
  { stepType: "extract_scenarios" },
  { stepType: "generate_proposal" },
];
