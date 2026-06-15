import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AiScenarioCard } from "./ai-scenario-card";
import { PlanOverviewSidebar } from "./plan-overview-sidebar";
import type { LayoutProps } from "./test-plan-detail.types";

import { ResizeHandle } from "@/shared/components/resize-handle";

export function LayoutAiFirst({
  plan,
  scenarios,
  selectedScenario,
}: LayoutProps) {
  const { t } = useTranslation();

  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const sidebarWidthRef = useRef(0);
  const sidebarCardRef = useRef<HTMLDivElement>(null);
  const handleSidebarResize = useCallback((delta: number) => {
    if (!sidebarWidthRef.current && sidebarCardRef.current) {
      sidebarWidthRef.current = sidebarCardRef.current.offsetWidth;
    }
    sidebarWidthRef.current = Math.max(
      220,
      Math.min(400, sidebarWidthRef.current - delta),
    );
    setSidebarWidth(sidebarWidthRef.current);
  }, []);

  const sourceChips = useMemo(() => {
    return plan.context_sources.map((src) => {
      const label =
        (src.config as { displayName?: string })?.displayName ??
        src.source_type;
      const icon =
        src.source_type === "github" ? (
          <GitHubIcon sx={{ fontSize: 12 }} />
        ) : (
          <ArticleOutlinedIcon sx={{ fontSize: 12 }} />
        );
      return { id: src.id, label, icon };
    });
  }, [plan.context_sources]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        mt: 2,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Main: chat + scenario cards */}
      <Card
        variant="outlined"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Context chips */}
        {sourceChips.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              {t("testPlanDetail.planContext")}
            </Typography>
            {sourceChips.map((chip) => (
              <Chip
                key={chip.id}
                icon={chip.icon}
                label={chip.label}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: 11,
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            ))}
          </Box>
        )}

        {/* Chat messages placeholder */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: 3,
            py: 2,
          }}
        >
          {/* System message */}
          <Box
            sx={{
              textAlign: "center",
              py: 2,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "text.disabled",
                px: 2,
                py: 0.75,
                bgcolor: "grey.50",
                borderRadius: 2,
                display: "inline-block",
              }}
            >
              {t("testPlanDetail.aiFirstWelcome", {
                count: scenarios.length,
              })}
            </Typography>
          </Box>

          {/* AI response placeholder */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mb: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{ fontSize: 10, fontWeight: 700, color: "white" }}
                >
                  Q
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                QAAP AI
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                {selectedScenario?.source_model ?? ""}
              </Typography>
            </Box>
            <Box sx={{ pl: 3.5 }}>
              <Typography
                sx={{ fontSize: 13, lineHeight: 1.7, color: "text.secondary" }}
              >
                {t("testPlanDetail.aiFirstPlaceholderMsg")}
              </Typography>
            </Box>
          </Box>

          {/* Scenario cards */}
          <Box sx={{ pl: 3.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {t("testPlanDetail.testScenarios")}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                {scenarios.length} {t("testPlanDetail.scenarios").toLowerCase()}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {scenarios.map((s) => {
                const pct = Math.round(s.confidence * 100);
                const gherkin = `@${s.review_status} @confidence:${pct}\n${s.gherkin_text}`;
                return (
                  <AiScenarioCard
                    key={s.id}
                    scenario={s}
                    gherkinContent={gherkin}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Chat input */}
        <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("testPlanDetail.aiFirstInputPlaceholder")}
            disabled
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" disabled>
                      <SendOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
          />
        </Box>
      </Card>

      {/* Right sidebar: overview + stats */}
      <ResizeHandle onResize={handleSidebarResize} />
      <Card
        ref={sidebarCardRef}
        variant="outlined"
        sx={{
          ...(sidebarWidth != null
            ? { width: sidebarWidth, flexShrink: 0 }
            : { flex: "0 0 280px" }),
          minWidth: 220,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
          <PlanOverviewSidebar plan={plan} scenarios={scenarios} />
        </CardContent>
      </Card>
    </Box>
  );
}
