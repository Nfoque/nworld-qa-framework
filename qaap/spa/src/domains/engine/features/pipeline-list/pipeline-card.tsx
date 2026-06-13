import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import {
  Avatar,
  Box,
  Button,
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
  StepType,
} from "@/domains/engine/features/engine-run/engine-run.types";
import { PIPELINE_STEPS } from "@/domains/engine/features/engine-run/engine-run.types";

const STATUS_CHIP: Record<
  string,
  {
    labelKey: string;
    color: "default" | "primary" | "success" | "warning" | "error";
  }
> = {
  queued: { labelKey: "pipeline.statusQueued", color: "default" },
  running: { labelKey: "pipeline.statusRunning", color: "primary" },
  paused: { labelKey: "pipeline.statusPaused", color: "warning" },
  completed: { labelKey: "pipeline.statusCompleted", color: "success" },
  failed: { labelKey: "pipeline.statusFailed", color: "error" },
  cancelled: { labelKey: "pipeline.statusCancelled", color: "default" },
};

const STEP_I18N_KEYS: Record<StepType, string> = {
  collect: "pipeline.stageCollecting",
  extract_features: "pipeline.stageExtractingFeatures",
  extract_plans: "pipeline.stageExtractingPlans",
  extract_scenarios: "pipeline.stageExtractingScenarios",
  generate_proposal: "pipeline.stageGenerateProposal",
};

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
  const steps = job.steps ?? [];
  const activeStep = steps.find((s) => s.status === "running");
  const activeStepLabel = activeStep
    ? t(STEP_I18N_KEYS[activeStep.stepType])
    : null;

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
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}
            >
              Pipeline{" "}
              <Typography
                component="span"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  color: "text.secondary",
                }}
              >
                #{shortId}
              </Typography>
            </Typography>
            {activeStepLabel && (
              <>
                <Box
                  sx={{ color: "text.disabled", fontSize: 12, flexShrink: 0 }}
                >
                  ·
                </Box>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ fontSize: 12, color: "primary.main", fontWeight: 600 }}
                >
                  {activeStepLabel}
                </Typography>
              </>
            )}
          </Stack>

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

        {/* Row 3: Segmented progress bar based on steps */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
          {PIPELINE_STEPS.map((pipelineStep) => {
            const step = steps.find(
              (s) => s.stepType === pipelineStep.stepType,
            );
            const state = step
              ? step.status === "completed"
                ? "completed"
                : step.status === "running"
                  ? "active"
                  : step.status === "failed"
                    ? "error"
                    : "pending"
              : "pending";
            const i18nKey = STEP_I18N_KEYS[pipelineStep.stepType];
            return (
              <Tooltip
                key={pipelineStep.stepType}
                title={t(i18nKey)}
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
      </CardActionArea>

      {/* Review proposal CTA — only when the pipeline is paused awaiting review */}
      {job.status === "paused" && (
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={
              <FactCheckOutlinedIcon sx={{ fontSize: "16px !important" }} />
            }
            onClick={() =>
              navigate({
                to: "/engine/$jobId/review" as string,
                params: { jobId: job.id },
              })
            }
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            {t("pipeline.reviewProposal")}
          </Button>
        </Box>
      )}

      {/* Error message */}
      {job.errorMessage && (
        <Box
          sx={{
            mx: 2.5,
            mb: 2,
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
    </Card>
  );
}
