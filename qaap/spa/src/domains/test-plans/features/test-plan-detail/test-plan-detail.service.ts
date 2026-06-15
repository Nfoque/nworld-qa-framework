import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invokeFunction } from "@/shared/config/supabase";

export interface TestPlanScenario {
  id: string;
  title: string;
  description: string | null;
  gherkin_text: string;
  confidence: number;
  rationale: string;
  source_model: string;
  review_status: "pending" | "approved" | "rejected" | "modified";
  sort_order: number;
  category: string | null;
  version: number;
  created_at: string;
}

export interface TestPlanContextSource {
  id: string;
  source_type: string;
  config: Record<string, unknown>;
  sync_status: string;
  last_synced_at: string | null;
}

export interface TestPlanDetail {
  id: string;
  name: string;
  description: string;
  modality: string;
  status: string;
  target_framework: string;
  target_environments: string[];
  engine_job_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  created_by_avatar: string | null;
  scenarios: TestPlanScenario[];
  context_sources: TestPlanContextSource[];
}

export function useTestPlan(planId: string) {
  return useQuery({
    queryKey: ["test-plan", planId],
    queryFn: () =>
      invokeFunction<TestPlanDetail>("get-test-plan", {
        method: "POST",
        body: { planId },
      }),
  });
}

interface UpdateScenarioInput {
  scenarioId: string;
  description?: string | null;
  gherkinText?: string;
}

export function useUpdateScenario(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateScenarioInput) =>
      invokeFunction<TestPlanScenario>("update-scenario", {
        method: "PUT",
        body: input as unknown as Record<string, unknown>,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["test-plan", planId] }),
  });
}
