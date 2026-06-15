import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LayoutAiFirst } from "./layout-ai-first";
import { LayoutIde } from "./layout-ide";
import { LayoutStandard } from "./layout-standard";
import { LayoutSwitcher } from "./layout-switcher";
import { useTestPlan, useUpdateScenario } from "./test-plan-detail.service";
import type { LayoutVariant, Tab } from "./test-plan-detail.types";

import { testPlanDetailRoute } from "@/router";
import { DetailPageHeader } from "@/shared/components/detail-page-header";
import { ModalityBadge } from "@/shared/components/modality-badge";
import { getProjectColor } from "@/shared/utils/project-colors";
import { useSnackbar } from "@/shared/components/snackbar-provider";
import { StatusBadge } from "@/shared/components/status-badge";
import { useSidebar } from "@/shared/layout/sidebar-context";

export function TestPlanDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { planId } = testPlanDetailRoute.useParams();
  const { data: plan, isLoading, error } = useTestPlan(planId);
  const updateScenario = useUpdateScenario(planId);
  const { setCollapsed } = useSidebar();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  const [layout, setLayout] = useState<LayoutVariant>("standard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [chatOpen, setChatOpen] = useState(true);
  const [gherkinDraft, setGherkinDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [descriptionEditing, setDescriptionEditing] = useState(false);

  const scenarios = useMemo(() => plan?.scenarios ?? [], [plan?.scenarios]);

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedId) ?? scenarios[0] ?? null,
    [scenarios, selectedId],
  );

  const prevSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    const id = selectedScenario?.id ?? null;
    if (id !== prevSelectedRef.current) {
      prevSelectedRef.current = id;
      setGherkinDraft(null);
      setDescriptionDraft(null);
      setDescriptionEditing(false);
    }
  }, [selectedScenario?.id]);

  const sourceModel = useMemo(() => {
    const models = new Set(
      scenarios.map((s) => s.source_model).filter(Boolean),
    );
    return models.size === 1 ? [...models][0] : null;
  }, [scenarios]);

  const gherkinBase = useMemo(() => {
    if (!selectedScenario) return "";
    const pct = Math.round(selectedScenario.confidence * 100);
    return `@${selectedScenario.review_status} @confidence:${pct}\n${selectedScenario.gherkin_text}`;
  }, [selectedScenario]);

  const gherkinContent = gherkinDraft ?? gherkinBase;
  const descriptionContent =
    descriptionDraft ?? selectedScenario?.description ?? "";
  const hasDraft = gherkinDraft !== null || descriptionDraft !== null;

  function handleSave() {
    if (!selectedScenario || !hasDraft) return;
    const input: Record<string, unknown> = { scenarioId: selectedScenario.id };
    if (descriptionDraft !== null) input.description = descriptionDraft;
    if (gherkinDraft !== null) {
      const raw = gherkinDraft.replace(/^@\S+.*\n/, "");
      input.gherkinText = raw;
    }
    updateScenario.mutate(
      input as Parameters<typeof updateScenario.mutate>[0],
      {
        onSuccess: () => {
          setGherkinDraft(null);
          setDescriptionDraft(null);
          setDescriptionEditing(false);
          showSnackbar(t("testPlanDetail.saved"));
        },
        onError: () => {
          showSnackbar(t("testPlanDetail.saveError"), "error");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("testPlanDetail.loadError")}</Alert>
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{t("testPlanDetail.notFound")}</Alert>
      </Box>
    );
  }

  const layoutProps = {
    plan,
    scenarios,
    selectedScenario,
    onSelectScenario: setSelectedId,
    activeTab,
    onTabChange: setActiveTab,
    gherkinContent,
    descriptionContent,
    descriptionEditing,
    onDescriptionEditToggle: () => setDescriptionEditing(!descriptionEditing),
    onGherkinChange: setGherkinDraft,
    onDescriptionChange: setDescriptionDraft,
    hasDraft,
    onSave: handleSave,
    isSaving: updateScenario.isPending,
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <DetailPageHeader
        title={plan.name}
        onBack={() => navigate({ to: "/test-plans" })}
        subtitle={
          <>
            {plan.engine_job_name && (
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getProjectColor(plan.engine_job_name),
                  borderLeft: `3px solid ${getProjectColor(plan.engine_job_name)}`,
                  pl: 0.75,
                }}
              >
                {plan.engine_job_name}
              </Typography>
            )}
            <ModalityBadge modality={plan.modality} />
            <StatusBadge status={plan.status} />
            {sourceModel && (
              <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                {t("testPlanDetail.generatedBy", { model: sourceModel })}
              </Typography>
            )}
          </>
        }
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LayoutSwitcher value={layout} onChange={setLayout} />
            {layout === "standard" && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<ChatBubbleOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setChatOpen(!chatOpen)}
                sx={{
                  fontSize: 12,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                {chatOpen
                  ? t("testPlanDetail.hideChat")
                  : t("testPlanDetail.showChat")}
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              disabled
              sx={{
                fontSize: 12,
                textTransform: "none",
                color: "text.secondary",
              }}
            >
              {t("testPlanDetail.export")}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />}
              disabled
              sx={{ fontSize: 12, textTransform: "none", fontWeight: 700 }}
            >
              {t("testPlanDetail.run")}
            </Button>
          </Stack>
        }
      />

      {layout === "standard" && (
        <LayoutStandard {...layoutProps} chatOpen={chatOpen} />
      )}
      {layout === "ide" && <LayoutIde {...layoutProps} />}
      {layout === "ai-first" && <LayoutAiFirst {...layoutProps} />}
    </Box>
  );
}
