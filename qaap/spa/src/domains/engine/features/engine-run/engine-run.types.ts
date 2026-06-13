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

export interface ProposalPlan {
  id: string;
  name: string;
  confidence?: number;
  test_areas?: { scenarios?: unknown[] }[];
}

export interface ProposalData {
  test_plans: ProposalPlan[];
  coverage_gaps?: unknown[];
  stats?: {
    total_test_plans?: number;
    total_test_areas?: number;
    total_scenarios?: number;
    avg_scenario_confidence?: number;
  };
}

export interface PipelineStep {
  stepType: StepType;
  label: string;
  description: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    stepType: "collect",
    label: "Collecting",
    description: "Fetching raw data from connected sources",
  },
  {
    stepType: "extract_features",
    label: "Extracting Features",
    description: "Identifying high-level features from all sources",
  },
  {
    stepType: "extract_plans",
    label: "Extracting Test Plans",
    description: "Identifying testable areas per feature",
  },
  {
    stepType: "extract_scenarios",
    label: "Extracting Scenarios",
    description: "Generating Gherkin test scenarios",
  },
  {
    stepType: "generate_proposal",
    label: "Generating Proposal",
    description: "Assembling the final proposal for review",
  },
];
