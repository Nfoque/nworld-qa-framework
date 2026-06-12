import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorIcon from "@mui/icons-material/Error";
import GitHubIcon from "@mui/icons-material/GitHub";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { isInProgress } from "@/domains/engine/features/pipeline-list/pipeline-list.service";

import { useJob } from "./engine-run.service";
import { PIPELINE_STAGES, type JobStatus } from "./engine-run.types";

function getStageState(
  stageKey: JobStatus,
  currentStatus: JobStatus,
): "completed" | "active" | "pending" | "error" {
  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === stageKey);
  const currentIndex = PIPELINE_STAGES.findIndex(
    (s) => s.key === currentStatus,
  );
  if (currentStatus === "failed") {
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "error";
    return "pending";
  }
  if (currentStatus === "completed") return "completed";
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "active";
  return "pending";
}

function getProgress(status: JobStatus): { current: number; total: number } {
  if (status === "completed") return { current: PIPELINE_STAGES.length, total: PIPELINE_STAGES.length };
  if (status === "failed" || status === "cancelled") return { current: 0, total: PIPELINE_STAGES.length };
  const idx = PIPELINE_STAGES.findIndex((s) => s.key === status);
  return { current: Math.max(0, idx), total: PIPELINE_STAGES.length };
}

function formatMs(diffMs: number): string {
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function useLiveDuration(createdAt: string, completedAt?: string, isActive?: boolean): string {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const start = new Date(createdAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : now;
  return formatMs(end - start);
}

const STAGE_I18N_KEYS: Record<string, { label: string; desc: string }> = {
  queued: { label: "pipeline.stageQueued", desc: "pipeline.stageQueuedDesc" },
  collecting: { label: "pipeline.stageCollecting", desc: "pipeline.stageCollectingDesc" },
  extracting_features: { label: "pipeline.stageExtractingFeatures", desc: "pipeline.stageExtractingFeaturesDesc" },
  awaiting_feature_review: { label: "pipeline.stageFeatureReview", desc: "pipeline.stageFeatureReviewDesc" },
  extracting_plans: { label: "pipeline.stageExtractingPlans", desc: "pipeline.stageExtractingPlansDesc" },
  awaiting_plan_review: { label: "pipeline.stagePlanReview", desc: "pipeline.stagePlanReviewDesc" },
  extracting_scenarios: { label: "pipeline.stageExtractingScenarios", desc: "pipeline.stageExtractingScenariosDesc" },
  awaiting_scenario_review: { label: "pipeline.stageScenarioReview", desc: "pipeline.stageScenarioReviewDesc" },
  ready_for_codification: { label: "pipeline.stageReadyForCodification", desc: "pipeline.stageReadyForCodificationDesc" },
};

const STATUS_LABELS: Partial<
  Record<
    JobStatus,
    {
      labelKey: string;
      color: "default" | "primary" | "success" | "warning" | "error";
    }
  >
> = {
  queued: { labelKey: "pipeline.statusQueued", color: "default" },
  collecting: { labelKey: "pipeline.statusCollecting", color: "primary" },
  extracting_features: { labelKey: "pipeline.statusExtracting", color: "primary" },
  awaiting_feature_review: { labelKey: "pipeline.statusAwaitingReview", color: "warning" },
  extracting_plans: { labelKey: "pipeline.statusExtracting", color: "primary" },
  awaiting_plan_review: { labelKey: "pipeline.statusAwaitingReview", color: "warning" },
  extracting_scenarios: { labelKey: "pipeline.statusExtracting", color: "primary" },
  awaiting_scenario_review: { labelKey: "pipeline.statusAwaitingReview", color: "warning" },
  ready_for_codification: { labelKey: "pipeline.statusReady", color: "success" },
  completed: { labelKey: "pipeline.statusCompleted", color: "success" },
  failed: { labelKey: "pipeline.statusFailed", color: "error" },
  cancelled: { labelKey: "pipeline.statusCancelled", color: "default" },
};

const CONNECTOR_ICONS: Record<string, React.ElementType> = {
  github: GitHubIcon,
  jira: BugReportOutlinedIcon,
  confluence: DescriptionOutlinedIcon,
};

function InfoCard({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
          <Icon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}
          >
            {label}
          </Typography>
        </Stack>
        {value && (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
            {value}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function EngineRun() {
  const { t } = useTranslation();
  const { jobId } = useParams({ strict: false }) as { jobId: string };
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const running = job ? isInProgress(job.status) : false;
  const duration = useLiveDuration(job?.createdAt ?? "", job?.completedAt, running);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t("pipeline.jobNotFound")}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/pipelines" })}
          sx={{ mt: 2 }}
        >
          {t("pipeline.backToPipelines")}
        </Button>
      </Box>
    );
  }

  const statusInfo = STATUS_LABELS[job.status] ?? {
    labelKey: job.status,
    color: "default" as const,
  };
  const shortId = job.id.slice(0, 8);
  const totalSources = job.selectedSources.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );
  const progress = getProgress(job.status);
  const currentStageKey = PIPELINE_STAGES.find((s) => s.key === job.status);
  const currentStageI18n = currentStageKey ? STAGE_I18N_KEYS[currentStageKey.key] : null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate({ to: "/pipelines" })}
        size="small"
        color="inherit"
        sx={{ mb: 2 }}
      >
        {t("pipeline.backToPipelines")}
      </Button>

      {/* Header: Title + Status */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 22, mb: 0.25 }}>
            Pipeline{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 700, fontSize: 22, fontFamily: "monospace", color: "text.secondary" }}
            >
              #{shortId}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            {new Date(job.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Chip
          label={t(statusInfo.labelKey)}
          color={statusInfo.color}
          sx={{ fontWeight: 600, fontSize: 13, height: 32, px: 1 }}
        />
      </Stack>

      {/* Info cards row */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <InfoCard
          icon={LayersOutlinedIcon}
          label={t("pipeline.selectedSources")}
          value={`${totalSources}`}
        />
        <InfoCard
          icon={AccessTimeIcon}
          label={t("pipeline.pipelineProgress")}
          value={`${progress.current} / ${progress.total}`}
        />
        <InfoCard
          icon={CalendarTodayOutlinedIcon}
          label={t("tables.duration")}
          value={duration}
        />
        <InfoCard icon={PersonOutlineIcon} label={t("pipeline.createdBy")}>
          {job.createdByName ? (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.25 }}>
              <Avatar
                src={job.createdByAvatar ?? undefined}
                sx={{ width: 20, height: 20, fontSize: 10 }}
              >
                {job.createdByName[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                {job.createdByName}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
              —
            </Typography>
          )}
        </InfoCard>
      </Stack>

      {/* Two-column layout: Sources + Current stage | Timeline */}
      <Stack direction="row" spacing={3} sx={{ alignItems: "flex-start" }}>
        {/* Left: Timeline */}
        <Card variant="outlined" sx={{ flex: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                fontSize: 12,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("pipeline.pipelineProgress")}
            </Typography>

            <Timeline
              sx={{
                p: 0,
                m: 0,
                "& .MuiTimelineItem-root:before": { display: "none" },
              }}
            >
              {PIPELINE_STAGES.map((stage, idx) => {
                const state = getStageState(stage.key, job.status);
                const isLast = idx === PIPELINE_STAGES.length - 1;
                const i18nKeys = STAGE_I18N_KEYS[stage.key];

                return (
                  <TimelineItem key={stage.key}>
                    <TimelineSeparator>
                      <TimelineDot
                        variant={state === "pending" ? "outlined" : "filled"}
                        sx={{
                          p: 0,
                          m: 0,
                          border: "none",
                          bgcolor: "transparent",
                          boxShadow: "none",
                        }}
                      >
                        {state === "completed" && (
                          <CheckCircleIcon sx={{ fontSize: 26, color: "success.main" }} />
                        )}
                        {state === "active" && job.status === "queued" && (
                          <HourglassEmptyIcon sx={{ fontSize: 26, color: "primary.main" }} />
                        )}
                        {state === "active" && job.status !== "queued" && (
                          <RadioButtonCheckedIcon
                            sx={{
                              fontSize: 26,
                              color: "primary.main",
                              animation: "dotPulse 2s ease-in-out infinite",
                              "@keyframes dotPulse": {
                                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                                "50%": { opacity: 0.5, transform: "scale(1.15)" },
                              },
                            }}
                          />
                        )}
                        {state === "error" && (
                          <ErrorIcon sx={{ fontSize: 26, color: "error.main" }} />
                        )}
                        {state === "pending" && (
                          <CircleOutlinedIcon sx={{ fontSize: 26, color: "grey.300" }} />
                        )}
                      </TimelineDot>
                      {!isLast && (
                        <TimelineConnector
                          sx={{
                            bgcolor: state === "completed" ? "success.main" : "grey.200",
                            width: 2,
                          }}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: 1.25, px: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: state === "active" ? 700 : state === "completed" ? 500 : 400,
                            color: state === "pending" ? "text.disabled" : "text.primary",
                            fontSize: 13,
                          }}
                        >
                          {i18nKeys ? t(i18nKeys.label) : stage.label}
                        </Typography>
                        {state === "active" && job.status !== "queued" && (
                          <CircularProgress size={14} thickness={5} />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color: state === "pending" ? "text.disabled" : "text.secondary",
                          fontSize: 11,
                        }}
                      >
                        {i18nKeys ? t(i18nKeys.desc) : stage.description}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>

            {job.errorMessage && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "error.50",
                  border: "1px solid",
                  borderColor: "error.200",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "error.main" }}>
                  Error
                </Typography>
                <Typography variant="caption" sx={{ color: "error.dark" }}>
                  {job.errorMessage}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Right: Sources + Current stage */}
        <Stack spacing={2} sx={{ flex: 1, minWidth: 260 }}>
          {/* Current stage card */}
          {currentStageI18n && (
            <Card
              variant="outlined"
              sx={{
                borderColor: "primary.main",
                borderWidth: 2,
                bgcolor: "primary.50",
                animation: "cardGlow 3s ease-in-out infinite",
                "@keyframes cardGlow": {
                  "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,102,241,0.0)" },
                  "50%": { boxShadow: "0 0 12px 2px rgba(99,102,241,0.15)" },
                },
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    color: "primary.main",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  {t("pipeline.currentStage")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: 14, color: "primary.main", mb: 0.25 }}
                >
                  {t(currentStageI18n.label)}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
                  {t(currentStageI18n.desc)}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Sources card */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  mb: 1.5,
                  display: "block",
                }}
              >
                {t("pipeline.selectedSources")}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {job.selectedSources.flatMap((source) => {
                  const Icon = CONNECTOR_ICONS[source.connector] ?? SourceOutlinedIcon;
                  return source.items.map((item) => (
                    <Chip
                      key={`${source.connector}:${item}`}
                      icon={<Icon sx={{ fontSize: "14px !important" }} />}
                      label={item}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        height: 28,
                        "& .MuiChip-icon": { ml: 0.5 },
                      }}
                    />
                  ));
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
