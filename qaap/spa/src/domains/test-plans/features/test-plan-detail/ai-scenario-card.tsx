import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { Box, Button, Collapse, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { GherkinEditor } from "./gherkin-editor";
import type { TestPlanScenario } from "./test-plan-detail.service";

import { StatusBadge } from "@/shared/components/status-badge";

function getConfidenceColor(value: number): string {
  const pct = value * 100;
  if (pct >= 85) return "#16A34A";
  if (pct >= 60) return "#F59E0B";
  return "#DC2626";
}

export function AiScenarioCard({
  scenario,
  gherkinContent,
}: {
  scenario: TestPlanScenario;
  gherkinContent: string;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const confColor = getConfidenceColor(scenario.confidence);
  const pct = Math.round(scenario.confidence * 100);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: expanded ? "primary.light" : "divider",
        borderRadius: 1.5,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: confColor,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }}
          noWrap
        >
          {scenario.title}
        </Typography>
        <StatusBadge status={scenario.review_status} />
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: confColor,
            flexShrink: 0,
          }}
        >
          {pct}%
        </Typography>
        <ExpandMoreOutlinedIcon
          sx={{
            fontSize: 16,
            color: "text.disabled",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ maxHeight: 260, overflow: "auto" }}>
            <GherkinEditor content={gherkinContent} onChange={() => {}} />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              px: 1.5,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
              disabled
              sx={{ fontSize: 11, textTransform: "none", fontWeight: 600 }}
            >
              {t("testPlanDetail.approve")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
              disabled
              sx={{ fontSize: 11, textTransform: "none" }}
            >
              {t("testPlanDetail.edit")}
            </Button>
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<ErrorOutlinedIcon sx={{ fontSize: 14 }} />}
              disabled
              sx={{ fontSize: 11, textTransform: "none" }}
            >
              {t("testPlanDetail.reject")}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
