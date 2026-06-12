import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { isInProgress } from "./pipeline-list.service";

import type {
  EngineJob,
  JobStatus,
} from "@/domains/engine/features/engine-run/engine-run.types";
import { PIPELINE_STAGES } from "@/domains/engine/features/engine-run/engine-run.types";

const STATUS_CHIP: Record<
  string,
  {
    labelKey: string;
    color: "default" | "primary" | "success" | "warning" | "error";
  }
> = {
  queued: { labelKey: "pipeline.statusQueued", color: "default" },
  collecting: { labelKey: "pipeline.statusCollecting", color: "primary" },
  extracting_features: {
    labelKey: "pipeline.statusExtracting",
    color: "primary",
  },
  awaiting_feature_review: {
    labelKey: "pipeline.statusAwaitingReview",
    color: "warning",
  },
  extracting_plans: {
    labelKey: "pipeline.statusExtracting",
    color: "primary",
  },
  awaiting_plan_review: {
    labelKey: "pipeline.statusAwaitingReview",
    color: "warning",
  },
  extracting_scenarios: {
    labelKey: "pipeline.statusExtracting",
    color: "primary",
  },
  awaiting_scenario_review: {
    labelKey: "pipeline.statusAwaitingReview",
    color: "warning",
  },
  ready_for_codification: {
    labelKey: "pipeline.statusReady",
    color: "success",
  },
  completed: { labelKey: "pipeline.statusCompleted", color: "success" },
  failed: { labelKey: "pipeline.statusFailed", color: "error" },
  cancelled: { labelKey: "pipeline.statusCancelled", color: "default" },
};

const STAGE_I18N_KEYS: Record<string, string> = {
  queued: "pipeline.stageQueued",
  collecting: "pipeline.stageCollecting",
  extracting_features: "pipeline.stageExtractingFeatures",
  awaiting_feature_review: "pipeline.stageFeatureReview",
  extracting_plans: "pipeline.stageExtractingPlans",
  awaiting_plan_review: "pipeline.stagePlanReview",
  extracting_scenarios: "pipeline.stageExtractingScenarios",
  awaiting_scenario_review: "pipeline.stageScenarioReview",
  ready_for_codification: "pipeline.stageReadyForCodification",
};

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

function formatDuration(start?: string, end?: string): string | null {
  if (!start) return null;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diffMs = e - s;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

const STAGE_COLORS = {
  completed: "success.main",
  active: "primary.main",
  error: "error.main",
  pending: "grey.200",
} as const;

const CONNECTOR_ICONS: Record<string, React.ElementType> = {
  github: GitHubIcon,
  jira: BugReportOutlinedIcon,
  confluence: DescriptionOutlinedIcon,
};
const DEFAULT_CONNECTOR_ICON = SourceOutlinedIcon;

interface PipelineCardProps {
  job: EngineJob;
}

export function PipelineCard({ job }: PipelineCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chipInfo = STATUS_CHIP[job.status] ?? {
    labelKey: job.status,
    color: "default" as const,
  };
  const shortId = job.id.slice(0, 8);
  const duration = formatDuration(job.startedAt, job.completedAt);
  const running = isInProgress(job.status);

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        ...(job.status === "failed" && {
          borderColor: "error.light",
          bgcolor: "error.50",
        }),
      }}
    >
      <CardActionArea
        onClick={() =>
          navigate({ to: "/engine/$jobId", params: { jobId: job.id } })
        }
        sx={{ p: 2.5 }}
      >
        {/* Row 1: Title + status */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.25,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontSize: 14, fontWeight: 600 }}
          >
            Pipeline{" "}
            <Typography
              component="span"
              sx={{ fontSize: 14, fontWeight: 600, fontFamily: "monospace", color: "text.secondary" }}
            >
              #{shortId}
            </Typography>
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            {running && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.4, transform: "scale(0.8)" },
                  },
                }}
              />
            )}
            <Chip
              label={t(chipInfo.labelKey)}
              color={chipInfo.color}
              size="small"
              sx={{ fontWeight: 600, fontSize: 11, height: 24 }}
            />
          </Stack>
        </Stack>

        {/* Row 2: Source chips */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ flexWrap: "wrap", gap: 0.5, mb: 1.5 }}
        >
          {job.selectedSources.flatMap((s) => {
            const Icon = CONNECTOR_ICONS[s.connector] ?? DEFAULT_CONNECTOR_ICON;
            return s.items.map((item) => (
              <Chip
                key={`${s.connector}:${item}`}
                icon={<Icon sx={{ fontSize: "14px !important" }} />}
                label={item}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 12,
                  height: 26,
                  fontWeight: 500,
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            ));
          })}
        </Stack>

        {/* Row 3: Segmented progress bar */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
          {PIPELINE_STAGES.map((stage) => {
            const state = getStageState(stage.key, job.status);
            const i18nKey = STAGE_I18N_KEYS[stage.key];
            return (
              <Tooltip
                key={stage.key}
                title={i18nKey ? t(i18nKey) : stage.label}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: STAGE_COLORS[state],
                    transition: "background-color 0.3s",
                    ...(state === "active" && {
                      animation: "barPulse 1.5s ease-in-out infinite",
                      "@keyframes barPulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                      },
                    }),
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>

        {/* Row 4: Footer — creator + metadata */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            color: "text.secondary",
          }}
        >
          {job.createdByName ? (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Avatar
                src={job.createdByAvatar ?? undefined}
                sx={{ width: 18, height: 18, fontSize: 9 }}
              >
                {job.createdByName[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="caption" sx={{ fontSize: 11 }}>
                {job.createdByName}
              </Typography>
            </Stack>
          ) : (
            <Box />
          )}

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontSize: 11 }}>
              {new Date(job.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            {duration && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <AccessTimeIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" sx={{ fontSize: 11 }}>
                  {duration}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* Error message */}
        {job.errorMessage && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: "error.50",
              border: "1px solid",
              borderColor: "error.200",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "error.main", fontSize: 11 }}
            >
              {job.errorMessage}
            </Typography>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
