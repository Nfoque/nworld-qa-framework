import { useMutation } from "@tanstack/react-query";

import type { AcceptProposalResponse, Proposal } from "./proposal-review.types";

import { invokeFunction } from "@/shared/config/supabase";

export { useJob } from "@/domains/engine/features/engine-run/engine-run.service";

export function useAcceptProposal() {
  return useMutation({
    mutationFn: ({
      jobId,
      proposal,
    }: {
      jobId: string;
      proposal: Proposal;
    }) =>
      invokeFunction<AcceptProposalResponse>("accept-proposal", {
        method: "POST",
        body: { jobId, proposal },
      }),
  });
}
