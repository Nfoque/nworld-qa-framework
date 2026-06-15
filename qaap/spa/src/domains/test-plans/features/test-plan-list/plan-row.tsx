import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";

import type { TestPlan } from "./test-plan-list.service";

import { ModalityBadge } from "@/shared/components/modality-badge";
import { getProjectColor } from "@/shared/utils/project-colors";

const GRID_COLUMNS = "120px minmax(200px, 2fr) 80px 80px 160px 90px";

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export { GRID_COLUMNS };

export function PlanRow({ plan }: { plan: TestPlan }) {
  const navigate = useNavigate();
  const projectColor = getProjectColor(plan.engine_job_name);

  return (
    <Box
      onClick={() =>
        navigate({
          to: "/test-plans/$planId",
          params: { planId: plan.id },
        })
      }
      sx={{
        display: "grid",
        gridTemplateColumns: GRID_COLUMNS,
        px: 2.5,
        py: 1.75,
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        borderLeft: `3px solid ${projectColor}`,
        cursor: "pointer",
        transition: "background-color 0.15s",
        "&:hover": { bgcolor: "action.hover" },
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Project */}
      <Typography
        sx={{ fontSize: 12, color: projectColor, fontWeight: 600 }}
        noWrap
        title={plan.engine_job_name ?? ""}
      >
        {plan.engine_job_name ?? "—"}
      </Typography>

      {/* Name + framework */}
      <Box sx={{ minWidth: 0, pr: 2 }}>
        <Typography
          sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}
          noWrap
        >
          {plan.name}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: "text.disabled",
            textTransform: "capitalize",
          }}
        >
          {plan.target_framework}
        </Typography>
      </Box>

      {/* Modality */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ModalityBadge modality={plan.modality} />
      </Box>

      {/* Scenario count */}
      <Typography sx={{ fontWeight: 700, fontSize: 14, textAlign: "center" }}>
        {plan.scenario_count}
      </Typography>

      {/* Created by */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: "center", justifyContent: "center", minWidth: 0 }}
      >
        {plan.created_by_name && (
          <>
            <Avatar
              src={plan.created_by_avatar ?? undefined}
              slotProps={{ img: { referrerPolicy: "no-referrer" } }}
              sx={{ width: 20, height: 20, fontSize: 9 }}
            >
              {plan.created_by_name[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
              {plan.created_by_name}
            </Typography>
          </>
        )}
      </Stack>

      {/* Updated */}
      <Typography
        sx={{ fontSize: 12, color: "text.disabled", textAlign: "right" }}
      >
        {formatRelativeTime(plan.created_at)}
      </Typography>
    </Box>
  );
}
