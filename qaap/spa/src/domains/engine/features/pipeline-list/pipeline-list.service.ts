import { useQuery } from "@tanstack/react-query";

import type { EngineJob } from "@/domains/engine/features/engine-run/engine-run.types";
import { invokeFunction } from "@/shared/config/supabase";

export function useJobs() {
  return useQuery({
    queryKey: ["engine-jobs"],
    queryFn: () => invokeFunction<EngineJob[]>("list-engine-jobs", { method: "POST" }),
    refetchInterval: 10000,
  });
}

const IN_PROGRESS_STATUSES = new Set([
  "queued",
  "collecting",
  "extracting_features",
  "awaiting_feature_review",
  "extracting_plans",
  "awaiting_plan_review",
  "extracting_scenarios",
  "awaiting_scenario_review",
  "ready_for_codification",
]);

export function isInProgress(status: string): boolean {
  return IN_PROGRESS_STATUSES.has(status);
}
