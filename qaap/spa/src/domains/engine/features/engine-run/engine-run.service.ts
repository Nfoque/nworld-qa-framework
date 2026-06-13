import { useMutation, useQuery } from "@tanstack/react-query";

import type { EngineJob, SelectedSource } from "./engine-run.types";

import { invokeFunction } from "@/shared/config/supabase";

export function useCreateJob() {
  return useMutation({
    mutationFn: (selectedSources: SelectedSource[]) =>
      invokeFunction<EngineJob>("create-engine-job", {
        method: "POST",
        body: { selectedSources },
      }),
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["engine-job", jobId],
    queryFn: () =>
      invokeFunction<EngineJob>("get-engine-job", {
        method: "POST",
        body: { jobId },
      }),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === "completed" ||
        status === "failed" ||
        status === "cancelled"
      )
        return false;
      return 5000;
    },
  });
}
