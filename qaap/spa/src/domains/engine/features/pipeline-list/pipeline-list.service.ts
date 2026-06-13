import { useQuery } from "@tanstack/react-query";

import type { EngineJob } from "@/domains/engine/features/engine-run/engine-run.types";
import { invokeFunction } from "@/shared/config/supabase";

export function useJobs() {
  return useQuery({
    queryKey: ["engine-jobs"],
    queryFn: () => invokeFunction<EngineJob[]>("list-engine-jobs", { method: "POST" }),
    refetchInterval: 60000,
  });
}

const IN_PROGRESS_STATUSES = new Set(["queued", "running"]);

export function isInProgress(status: string): boolean {
  return IN_PROGRESS_STATUSES.has(status);
}
