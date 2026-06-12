export type JobStatus =
  | "queued"
  | "collecting"
  | "extracting_features"
  | "awaiting_feature_review"
  | "extracting_plans"
  | "awaiting_plan_review"
  | "extracting_scenarios"
  | "awaiting_scenario_review"
  | "ready_for_codification"
  | "completed"
  | "failed"
  | "cancelled";

export interface SelectedSource {
  connector: string;
  items: string[];
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
}

export interface PipelineStage {
  key: JobStatus;
  label: string;
  description: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "queued", label: "Queued", description: "Waiting to start processing" },
  { key: "collecting", label: "Collecting", description: "Fetching raw data from connected sources" },
  { key: "extracting_features", label: "Extracting Features", description: "Identifying high-level features from all sources" },
  { key: "awaiting_feature_review", label: "Feature Review", description: "Review and approve discovered features" },
  { key: "extracting_plans", label: "Extracting Test Plans", description: "Identifying testable areas per feature" },
  { key: "awaiting_plan_review", label: "Plan Review", description: "Review and approve test areas" },
  { key: "extracting_scenarios", label: "Extracting Scenarios", description: "Generating Gherkin test scenarios" },
  { key: "awaiting_scenario_review", label: "Scenario Review", description: "Review and approve scenarios" },
  { key: "ready_for_codification", label: "Ready for Codification", description: "Scenarios approved and ready for code generation" },
];
