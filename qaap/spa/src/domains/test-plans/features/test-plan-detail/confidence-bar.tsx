import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TestPlanScenario } from "./test-plan-detail.service";

const GREEN = "#16A34A";
const AMBER = "#F59E0B";
const RED = "#DC2626";

export function ConfidenceBar({
  scenarios,
}: {
  scenarios: TestPlanScenario[];
}) {
  const { t } = useTranslation();
  const total = scenarios.length;

  const { high, medium, low, avg } = useMemo(() => {
    let h = 0,
      m = 0,
      l = 0,
      sum = 0;
    for (const s of scenarios) {
      const pct = s.confidence * 100;
      sum += pct;
      if (pct >= 85) h++;
      else if (pct >= 60) m++;
      else l++;
    }
    return {
      high: h,
      medium: m,
      low: l,
      avg: total > 0 ? Math.round(sum / total) : 0,
    };
  }, [scenarios, total]);

  if (total === 0) return null;

  const pctH = (high / total) * 100;
  const pctM = (medium / total) * 100;
  const pctL = (low / total) * 100;

  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        px: 2.5,
        py: 1.25,
      }}
    >
      {/* Stacked bar */}
      <Box
        sx={{
          display: "flex",
          height: 6,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "grey.100",
          mb: 0.75,
        }}
      >
        {pctH > 0 && <Box sx={{ width: `${pctH}%`, bgcolor: GREEN }} />}
        {pctM > 0 && <Box sx={{ width: `${pctM}%`, bgcolor: AMBER }} />}
        {pctL > 0 && <Box sx={{ width: `${pctL}%`, bgcolor: RED }} />}
      </Box>

      {/* Labels */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Label
          color={GREEN}
          count={high}
          pct={Math.round(pctH)}
          label={t("testPlanDetail.confidenceHigh")}
        />
        <Label
          color={AMBER}
          count={medium}
          pct={Math.round(pctM)}
          label={t("testPlanDetail.confidenceMedium")}
        />
        <Label
          color={RED}
          count={low}
          pct={Math.round(pctL)}
          label={t("testPlanDetail.confidenceLow")}
        />
        <Typography
          sx={{
            ml: "auto",
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          {t("testPlanDetail.avgConfidence")}: {avg}%
        </Typography>
      </Box>
    </Box>
  );
}

function Label({
  color,
  count,
  pct,
  label,
}: {
  color: string;
  count: number;
  pct: number;
  label: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
        {count} {label} ({pct}%)
      </Typography>
    </Box>
  );
}
