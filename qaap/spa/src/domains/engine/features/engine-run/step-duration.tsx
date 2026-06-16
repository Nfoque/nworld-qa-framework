import { Typography } from "@mui/material";

import type { EngineJobStep } from "./engine-run.types";

import { useLiveDuration } from "@/shared/hooks/use-live-duration";

export function StepDuration({ step }: { step: EngineJobStep }) {
  const isActive = step.status === "running";
  const duration = useLiveDuration(
    step.startedAt ?? new Date().toISOString(),
    step.completedAt,
    isActive,
  );

  if (!duration) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        fontSize: 11,
        fontFamily: "monospace",
        color: isActive ? "primary.main" : "text.secondary",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {duration}
    </Typography>
  );
}
