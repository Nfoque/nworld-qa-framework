import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ConfidenceBar } from "./confidence-bar";
import type {
  TestPlanDetail,
  TestPlanScenario,
} from "./test-plan-detail.service";

import { StatusBadge } from "@/shared/components/status-badge";

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: 13, fontWeight: 600, color: color ?? "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function PlanOverviewSidebar({
  plan,
  scenarios,
}: {
  plan: TestPlanDetail;
  scenarios: TestPlanScenario[];
}) {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    let approved = 0,
      pending = 0,
      rejected = 0;
    for (const s of scenarios) {
      if (s.review_status === "approved") approved++;
      else if (s.review_status === "rejected") rejected++;
      else pending++;
    }
    return { approved, pending, rejected };
  }, [scenarios]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* Plan Overview */}
      <Box
        sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "text.secondary",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {t("testPlanDetail.planOverview")}
        </Typography>
        <StatRow
          label={t("testPlanDetail.scenarios")}
          value={scenarios.length}
        />
        <StatRow
          label={t("testPlanDetail.approved")}
          value={counts.approved}
          color="#16A34A"
        />
        <StatRow
          label={t("testPlanDetail.pending")}
          value={counts.pending}
          color="#F59E0B"
        />
        <StatRow
          label={t("testPlanDetail.rejected")}
          value={counts.rejected}
          color="#DC2626"
        />
      </Box>

      {/* Confidence */}
      <Box
        sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "text.secondary",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {t("testPlanDetail.confidence")}
        </Typography>
        <ConfidenceBar scenarios={scenarios} />
      </Box>

      {/* Context Sources */}
      {plan.context_sources.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "text.secondary",
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("testPlanDetail.sources")}
          </Typography>
          {plan.context_sources.map((src) => (
            <Box
              key={src.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.75,
              }}
            >
              <Typography sx={{ fontSize: 12, flex: 1, minWidth: 0 }} noWrap>
                {src.source_type}
              </Typography>
              <StatusBadge status={src.sync_status} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
