import { Box, Typography } from "@mui/material";

const HEALTH_MAP: Record<string, { label: string; color: string }> = {
  healthy: { label: "Healthy", color: "#16A34A" },
  degrading: { label: "Degrading", color: "#EC683E" },
  critical: { label: "Critical", color: "#D13B5F" },
};

interface HealthIndicatorProps {
  health: string;
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const config = HEALTH_MAP[health] ?? HEALTH_MAP.healthy;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: config.color }}
      />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: config.color }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}
