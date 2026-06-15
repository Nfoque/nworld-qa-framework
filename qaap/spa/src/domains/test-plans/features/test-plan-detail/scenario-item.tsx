import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Typography } from "@mui/material";

import type { TestPlanScenario } from "./test-plan-detail.service";

const STATUS_ICONS: Record<
  string,
  { icon: typeof CheckCircleOutlinedIcon; color: string }
> = {
  approved: { icon: CheckCircleOutlinedIcon, color: "#16A34A" },
  rejected: { icon: ErrorOutlinedIcon, color: "#DC2626" },
  modified: { icon: EditOutlinedIcon, color: "#217BEE" },
  pending: { icon: RadioButtonUncheckedIcon, color: "#9CA3AF" },
};

function getConfidenceColor(value: number): string {
  const pct = value * 100;
  if (pct >= 85) return "#16A34A";
  if (pct >= 60) return "#F59E0B";
  return "#DC2626";
}

export function ScenarioItem({
  scenario,
  selected,
  onSelect,
}: {
  scenario: TestPlanScenario;
  selected: boolean;
  onSelect: () => void;
}) {
  const statusCfg =
    STATUS_ICONS[scenario.review_status] ?? STATUS_ICONS.pending;
  const StatusIcon = statusCfg.icon;
  const confColor = getConfidenceColor(scenario.confidence);

  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        px: 1.5,
        py: 1,
        cursor: "pointer",
        borderRadius: 1,
        transition: "background-color 0.15s",
        bgcolor: selected ? "primary.light" : "transparent",
        "&:hover": { bgcolor: selected ? "primary.light" : "action.hover" },
      }}
    >
      {/* Confidence dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: confColor,
          flexShrink: 0,
          mt: "4px",
        }}
      />

      {/* Title + meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: selected ? 600 : 500,
            lineHeight: 1.3,
            color: selected ? "primary.main" : "text.primary",
          }}
        >
          {scenario.title}
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: "text.disabled" }} noWrap>
          {Math.round(scenario.confidence * 100)}%
        </Typography>
      </Box>

      {/* Status icon */}
      <StatusIcon
        sx={{ fontSize: 16, color: statusCfg.color, flexShrink: 0 }}
      />
    </Box>
  );
}
