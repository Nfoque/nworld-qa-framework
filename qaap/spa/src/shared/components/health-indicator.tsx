import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const HEALTH_COLORS: Record<string, string> = {
  healthy: "#16A34A",
  degrading: "#EC683E",
  critical: "#D13B5F",
};

interface HealthIndicatorProps {
  health: string;
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const { t } = useTranslation();
  const color = HEALTH_COLORS[health] ?? HEALTH_COLORS.healthy;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }}
      />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color }}
      >
        {t(`health.${health}`, health)}
      </Typography>
    </Box>
  );
}
