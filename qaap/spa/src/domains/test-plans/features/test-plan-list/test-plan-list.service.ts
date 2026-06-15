import { useQuery } from "@tanstack/react-query";

import { invokeFunction } from "@/shared/config/supabase";

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  modality: string;
  status: string;
  target_framework: string;
  engine_job_id: string | null;
  created_by: string;
  created_at: string;
  created_by_name: string | null;
  created_by_avatar: string | null;
  scenario_count: number;
}

export function useTestPlans() {
  return useQuery({
    queryKey: ["test-plans"],
    queryFn: () =>
      invokeFunction<TestPlan[]>("list-test-plans", { method: "GET" }),
  });
}
