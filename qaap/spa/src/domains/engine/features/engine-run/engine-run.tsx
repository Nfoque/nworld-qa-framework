import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import ErrorIcon from "@mui/icons-material/Error";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
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
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useJob } from "./engine-run.service";
import {
  PIPELINE_STEPS,
  type EngineJobStep,
  type ProposalData,
} from "./engine-run.types";
import {
  STEP_I18N_KEYS,
  getProgress,
  getStepState,
  getStepSummary,
  hasData,
} from "./engine-run.utils";
import { InfoCard } from "./info-card";
import { MetricBox } from "./metric-box";
import { StepDataModal } from "./step-data-modal";
import { StepDuration } from "./step-duration";

import {
  CONNECTOR_ICONS,
  STATUS_LABELS,
} from "@/domains/engine/engine.constants";
import { isInProgress } from "@/domains/engine/features/pipeline-list/pipeline-list.service";
import { useLiveDuration } from "@/shared/hooks/use-live-duration";

export function EngineRun() {
  const { t } = useTranslation();
  const { jobId } = useParams({ strict: false }) as { jobId: string };
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const running = job ? isInProgress(job.status) : false;
  const duration = useLiveDuration(
    job?.createdAt ?? "",
    job?.completedAt,
    running,
  );
  const [inspectedStep, setInspectedStep] = useState<EngineJobStep | null>(
    null,
  );

  const handleStepClick = useCallback((step: EngineJobStep | undefined) => {
    if (!step) return;
    if (hasData(step.input) || hasData(step.output) || hasData(step.meta)) {
      setInspectedStep(step);
    }
  }, []);

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

  const steps = job.steps ?? [];
  const statusInfo = STATUS_LABELS[job.status] ?? {
    labelKey: job.status,
    color: "default" as const,
  };
  const shortId = job.id.slice(0, 8);
  const totalSources = job.selectedSources.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );
  const progress = getProgress(steps);
  const activeStep = steps.find((s) => s.status === "running");
  const activeStepI18n = activeStep
    ? STEP_I18N_KEYS[activeStep.stepType]
    : null;

  const proposalStep = steps.find(
    (s) => s.stepType === "generate_proposal" && s.status === "completed",
  );
  const proposal = (
    proposalStep?.output as { proposal?: ProposalData } | undefined
  )?.proposal;
  const topPlans = proposal
    ? [...proposal.test_plans]
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
        .slice(0, 5)
    : [];

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
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontSize: 22, mb: 0.25 }}
          >
            Pipeline{" "}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: 22,
                fontFamily: "monospace",
                color: "text.secondary",
              }}
            >
              #{shortId}
            </Typography>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 13 }}
          >
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
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", mt: 0.25 }}
            >
              <Avatar
                src={job.createdByAvatar ?? undefined}
                sx={{ width: 20, height: 20, fontSize: 10 }}
              >
                {job.createdByName[0]?.toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: 13 }}
              >
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

      <StepDataModal
        step={inspectedStep}
        onClose={() => setInspectedStep(null)}
      />

      {/* Two-column layout: Timeline | Sources + Current stage */}
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

            <Box>
              {PIPELINE_STEPS.map((pipelineStep, idx) => {
                const step = steps.find(
                  (s) => s.stepType === pipelineStep.stepType,
                );
                const state = getStepState(step);
                const isLast = idx === PIPELINE_STEPS.length - 1;
                const i18nKeys = STEP_I18N_KEYS[pipelineStep.stepType];
                const summary = getStepSummary(step);
                const clickable =
                  !!step &&
                  (hasData(step.input) ||
                    hasData(step.output) ||
                    hasData(step.meta));

                return (
                  <Box
                    key={pipelineStep.stepType}
                    sx={{ display: "flex", gap: 1.5 }}
                  >
                    {/* Rail column: icon + connecting line, both centered on 26px axis */}
                    <Box
                      sx={{
                        width: 26,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {/* Icon — height matches the title row so it aligns with the title */}
                      <Box
                        sx={{
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {state === "completed" && (
                          <CheckCircleIcon
                            sx={{
                              fontSize: 26,
                              color: "success.main",
                              display: "block",
                            }}
                          />
                        )}
                        {state === "active" && (
                          <RadioButtonCheckedIcon
                            sx={{
                              fontSize: 26,
                              color: "primary.main",
                              display: "block",
                              animation: "dotPulse 2s ease-in-out infinite",
                              "@keyframes dotPulse": {
                                "0%, 100%": {
                                  opacity: 1,
                                  transform: "scale(1)",
                                },
                                "50%": {
                                  opacity: 0.5,
                                  transform: "scale(1.15)",
                                },
                              },
                            }}
                          />
                        )}
                        {state === "error" && (
                          <ErrorIcon
                            sx={{
                              fontSize: 26,
                              color: "error.main",
                              display: "block",
                            }}
                          />
                        )}
                        {state === "pending" && (
                          <CircleOutlinedIcon
                            sx={{
                              fontSize: 26,
                              color: "grey.300",
                              display: "block",
                            }}
                          />
                        )}
                      </Box>
                      {/* Connecting line — grows to fill the gap down to the next icon */}
                      {!isLast && (
                        <Box
                          sx={{
                            flexGrow: 1,
                            width: 2,
                            my: 0.5,
                            minHeight: 12,
                            borderRadius: 1,
                            bgcolor:
                              state === "completed"
                                ? "success.main"
                                : "grey.200",
                          }}
                        />
                      )}
                    </Box>

                    {/* Content */}
                    <Box
                      onClick={() => handleStepClick(step)}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        pb: isLast ? 0 : 2,
                        px: 1,
                        borderRadius: 1,
                        cursor: clickable ? "pointer" : "default",
                        "&:hover": clickable ? { bgcolor: "action.hover" } : {},
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", minHeight: 26 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              state === "active"
                                ? 700
                                : state === "completed"
                                  ? 500
                                  : 400,
                            color:
                              state === "pending"
                                ? "text.disabled"
                                : "text.primary",
                            fontSize: 13,
                          }}
                        >
                          {t(i18nKeys.label)}
                        </Typography>
                        {state === "active" && (
                          <CircularProgress size={14} thickness={5} />
                        )}
                        {step?.startedAt &&
                          (state === "active" ||
                            state === "completed" ||
                            state === "error") && <StepDuration step={step} />}
                        {step &&
                          (hasData(step.input) || hasData(step.output)) && (
                            <Chip
                              icon={
                                <DataObjectIcon
                                  sx={{ fontSize: "14px !important" }}
                                />
                              }
                              label="JSON"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStepClick(step);
                              }}
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                bgcolor: "action.hover",
                                color: "primary.main",
                                "& .MuiChip-icon": { color: "primary.main" },
                              }}
                            />
                          )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color:
                            state === "pending"
                              ? "text.disabled"
                              : "text.secondary",
                          fontSize: 11,
                        }}
                      >
                        {t(i18nKeys.desc)}
                      </Typography>
                      {summary && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "monospace",
                            color:
                              state === "active"
                                ? "primary.main"
                                : "success.dark",
                          }}
                        >
                          {summary}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {job.status === "paused" && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<FactCheckOutlinedIcon />}
                onClick={() =>
                  navigate({
                    to: "/engine/$jobId/review",
                    params: { jobId: job.id },
                  })
                }
                sx={{
                  mt: 2.5,
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.25,
                }}
              >
                {t("pipeline.reviewProposal")}
              </Button>
            )}

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
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 0.5, color: "error.main" }}
                >
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
          {/* Proposal summary card — shown once the proposal is ready */}
          {proposal && (
            <Card variant="outlined" sx={{ borderColor: "success.light" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: "success.dark",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  {t("pipeline.proposalSummary")}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <MetricBox
                    value={
                      proposal.stats?.total_test_plans ??
                      proposal.test_plans.length
                    }
                    label={t("pipeline.testPlans")}
                  />
                  <MetricBox
                    value={proposal.stats?.total_test_areas ?? 0}
                    label={t("pipeline.testAreas")}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <MetricBox
                    value={proposal.stats?.total_scenarios ?? 0}
                    label={t("pipeline.scenarios")}
                  />
                  <MetricBox
                    value={`${Math.round((proposal.stats?.avg_scenario_confidence ?? 0) * 100)}%`}
                    label={t("pipeline.avgConfidence")}
                  />
                </Stack>

                {proposal.coverage_gaps &&
                  proposal.coverage_gaps.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center", mt: 1.5 }}
                    >
                      <WarningAmberOutlinedIcon
                        sx={{ fontSize: 15, color: "warning.main" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 11, color: "text.secondary" }}
                      >
                        {t("pipeline.coverageGaps", {
                          count: proposal.coverage_gaps.length,
                        })}
                      </Typography>
                    </Stack>
                  )}

                {topPlans.length > 0 && (
                  <>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                        mt: 2,
                        mb: 1,
                      }}
                    >
                      {t("pipeline.topPlans")}
                    </Typography>
                    <Stack spacing={0.75}>
                      {topPlans.map((plan) => {
                        const scenarioCount = (plan.test_areas ?? []).reduce(
                          (sum, a) => sum + (a.scenarios?.length ?? 0),
                          0,
                        );
                        return (
                          <Stack
                            key={plan.id}
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ fontSize: 12, flex: 1, minWidth: 0 }}
                            >
                              {plan.name}
                            </Typography>
                            {scenarioCount > 0 && (
                              <Chip
                                label={scenarioCount}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: 10,
                                  fontWeight: 600,
                                }}
                              />
                            )}
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontFamily: "monospace",
                                color: "success.dark",
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {Math.round((plan.confidence ?? 0) * 100)}%
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current stage card */}
          {activeStepI18n && (
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
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "primary.main",
                    mb: 0.25,
                  }}
                >
                  {t(activeStepI18n.label)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: 11, color: "text.secondary" }}
                >
                  {t(activeStepI18n.desc)}
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
                  const Icon =
                    CONNECTOR_ICONS[source.connector] ?? SourceOutlinedIcon;
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
