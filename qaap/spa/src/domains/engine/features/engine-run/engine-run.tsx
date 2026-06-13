import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorIcon from "@mui/icons-material/Error";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import DataObjectIcon from "@mui/icons-material/DataObject";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { isInProgress } from "@/domains/engine/features/pipeline-list/pipeline-list.service";

import { useJob } from "./engine-run.service";
import {
  PIPELINE_STEPS,
  type EngineJobStep,
  type JobStatus,
  type StepType,
} from "./engine-run.types";

function getStepState(
  step: EngineJobStep | undefined,
): "completed" | "active" | "pending" | "error" {
  if (!step) return "pending";
  switch (step.status) {
    case "completed":
      return "completed";
    case "running":
      return "active";
    case "failed":
      return "error";
    default:
      return "pending";
  }
}

function getProgress(steps: EngineJobStep[]): { current: number; total: number } {
  const completed = steps.filter((s) => s.status === "completed").length;
  return { current: completed, total: PIPELINE_STEPS.length };
}

function getStepSummary(step: EngineJobStep | undefined): string | null {
  if (!step) return null;
  const { status, stepType, output, input } = step;

  if (status === "running" && input) {
    const len = (obj: Record<string, unknown>, key: string) => {
      const arr = obj[key];
      return Array.isArray(arr) ? arr.length : 0;
    };
    switch (stepType) {
      case "extract_features": { const n = len(input, "raw_chunks"); return n ? `Processing ${n} chunks…` : null; }
      case "extract_plans": { const n = len(input, "features"); return n ? `Processing ${n} features…` : null; }
      case "extract_scenarios": { const n = len(input, "test_areas"); return n ? `Processing ${n} test areas…` : null; }
      case "generate_proposal": { const n = len(input, "scenarios"); return n ? `Assembling ${n} scenarios…` : null; }
      default: return null;
    }
  }

  if (status === "completed" && output) {
    const len = (key: string) => { const arr = output[key]; return Array.isArray(arr) ? arr.length : 0; };
    const avgConf = (key: string) => {
      const arr = output[key];
      if (!Array.isArray(arr) || !arr.length) return 0;
      return Math.round(
        (arr as Array<Record<string, unknown>>).reduce((s, x) => s + (typeof x.confidence === "number" ? x.confidence : 0), 0) / arr.length * 100,
      );
    };
    switch (stepType) {
      case "collect": {
        const n = len("raw_chunks");
        if (!n) return null;
        const sources = new Set((output.raw_chunks as Array<Record<string, unknown>>).map((c) => c.source)).size;
        return `${n} chunks · ${sources} source${sources !== 1 ? "s" : ""}`;
      }
      case "extract_features": {
        const n = len("features");
        return n ? `${n} features · ${avgConf("features")}% avg confidence` : null;
      }
      case "extract_plans": {
        const n = len("test_areas");
        return n ? `${n} test areas` : null;
      }
      case "extract_scenarios": {
        const n = len("scenarios");
        return n ? `${n} scenarios · ${avgConf("scenarios")}% avg confidence` : null;
      }
      case "generate_proposal": {
        const proposal = output.proposal as Record<string, unknown> | undefined;
        const stats = proposal?.stats as Record<string, unknown> | undefined;
        const plans = typeof stats?.total_test_plans === "number" ? stats.total_test_plans : 0;
        const scenarios = typeof stats?.total_scenarios === "number" ? stats.total_scenarios : 0;
        return plans ? `${plans} test plans · ${scenarios} scenarios` : null;
      }
      default: return null;
    }
  }

  return null;
}

function formatMs(diffMs: number): string {
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function useLiveDuration(startTime: string, endTime?: string | null, isActive?: boolean): string {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : now;
  return formatMs(end - start);
}

function StepDuration({ step }: { step: EngineJobStep }) {
  const isActive = step.status === "running";
  const duration = useLiveDuration(step.startedAt!, step.completedAt, isActive);

  return (
    <Typography
      variant="caption"
      sx={{
        fontSize: 11,
        fontFamily: "monospace",
        color: isActive ? "primary.main" : "text.secondary",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {duration}
    </Typography>
  );
}

const STEP_I18N_KEYS: Record<StepType, { label: string; desc: string }> = {
  collect: { label: "pipeline.stageCollecting", desc: "pipeline.stageCollectingDesc" },
  extract_features: { label: "pipeline.stageExtractingFeatures", desc: "pipeline.stageExtractingFeaturesDesc" },
  extract_plans: { label: "pipeline.stageExtractingPlans", desc: "pipeline.stageExtractingPlansDesc" },
  extract_scenarios: { label: "pipeline.stageExtractingScenarios", desc: "pipeline.stageExtractingScenariosDesc" },
  generate_proposal: { label: "pipeline.stageGenerateProposal", desc: "pipeline.stageGenerateProposalDesc" },
};

const STATUS_LABELS: Record<
  JobStatus,
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

function hasData(obj: Record<string, unknown> | null | undefined): boolean {
  return obj != null && Object.keys(obj).length > 0;
}

interface ProposalPlan {
  id: string;
  name: string;
  confidence?: number;
  test_areas?: { scenarios?: unknown[] }[];
}
interface ProposalData {
  test_plans: ProposalPlan[];
  coverage_gaps?: unknown[];
  stats?: {
    total_test_plans?: number;
    total_test_areas?: number;
    total_scenarios?: number;
    avg_scenario_confidence?: number;
  };
}

function MetricBox({ value, label }: { value: string | number; label: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.25,
        borderRadius: 1,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

const JSON_COLORS = {
  key: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  boolean: "#569cd6",
  null: "#569cd6",
  bracket: "#808080",
  toggle: "#6a9955",
} as const;

function JsonValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null) return <span style={{ color: JSON_COLORS.null, fontStyle: "italic" }}>null</span>;
  if (typeof value === "boolean") return <span style={{ color: JSON_COLORS.boolean }}>{String(value)}</span>;
  if (typeof value === "number") return <span style={{ color: JSON_COLORS.number }}>{value}</span>;
  if (typeof value === "string") {
    if (value.length > 300) {
      return <JsonLongString value={value} />;
    }
    return <span style={{ color: JSON_COLORS.string }}>&quot;{value}&quot;</span>;
  }
  if (Array.isArray(value)) return <JsonArray items={value} depth={depth} />;
  if (typeof value === "object") return <JsonObject data={value as Record<string, unknown>} depth={depth} />;
  return <span>{String(value)}</span>;
}

function JsonLongString({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = value.slice(0, 120);
  return (
    <span style={{ color: JSON_COLORS.string }}>
      &quot;{expanded ? value : `${preview}…`}&quot;
      <span
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        style={{ color: JSON_COLORS.toggle, cursor: "pointer", marginLeft: 4, fontSize: 10, userSelect: "none" }}
      >
        {expanded ? "collapse" : `+${value.length - 120} chars`}
      </span>
    </span>
  );
}

function JsonObject({ data, depth }: { data: Record<string, unknown>; depth: number }) {
  const entries = Object.entries(data);
  const [collapsed, setCollapsed] = useState(false);

  if (entries.length === 0) return <span style={{ color: JSON_COLORS.bracket }}>{"{}"}</span>;

  return (
    <span>
      <span
        onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
        style={{ cursor: "pointer", userSelect: "none", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}
      >
        {collapsed
          ? <KeyboardArrowRightIcon sx={{ fontSize: 14, color: JSON_COLORS.toggle }} />
          : <KeyboardArrowDownIcon sx={{ fontSize: 14, color: JSON_COLORS.toggle }} />}
      </span>
      <span style={{ color: JSON_COLORS.bracket }}>{"{"}</span>
      {collapsed ? (
        <span
          onClick={(e) => { e.stopPropagation(); setCollapsed(false); }}
          style={{ color: JSON_COLORS.toggle, cursor: "pointer", fontSize: 11 }}
        >
          {" "}{entries.length} keys…{" "}
        </span>
      ) : (
        <div style={{ paddingLeft: 20 }}>
          {entries.map(([key, val], i) => (
            <div key={key} style={{ lineHeight: 1.7 }}>
              <span style={{ color: JSON_COLORS.key, fontWeight: 500 }}>&quot;{key}&quot;</span>
              <span style={{ color: JSON_COLORS.bracket }}>: </span>
              <JsonValue value={val} depth={depth + 1} />
              {i < entries.length - 1 && <span style={{ color: JSON_COLORS.bracket }}>,</span>}
            </div>
          ))}
        </div>
      )}
      <span style={{ color: JSON_COLORS.bracket }}>{"}"}</span>
    </span>
  );
}

function JsonArray({ items, depth }: { items: unknown[]; depth: number }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return <span style={{ color: JSON_COLORS.bracket }}>[]</span>;

  const allPrimitive = items.every((i) => i === null || typeof i !== "object");
  if (allPrimitive && items.length <= 5) {
    return (
      <span>
        <span style={{ color: JSON_COLORS.bracket }}>[</span>
        {items.map((item, i) => (
          <span key={i}>
            <JsonValue value={item} depth={depth + 1} />
            {i < items.length - 1 && <span style={{ color: JSON_COLORS.bracket }}>, </span>}
          </span>
        ))}
        <span style={{ color: JSON_COLORS.bracket }}>]</span>
      </span>
    );
  }

  return (
    <span>
      <span
        onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
        style={{ cursor: "pointer", userSelect: "none", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}
      >
        {collapsed
          ? <KeyboardArrowRightIcon sx={{ fontSize: 14, color: JSON_COLORS.toggle }} />
          : <KeyboardArrowDownIcon sx={{ fontSize: 14, color: JSON_COLORS.toggle }} />}
      </span>
      <span style={{ color: JSON_COLORS.bracket }}>[</span>
      {collapsed ? (
        <span
          onClick={(e) => { e.stopPropagation(); setCollapsed(false); }}
          style={{ color: JSON_COLORS.toggle, cursor: "pointer", fontSize: 11 }}
        >
          {" "}{items.length} items…{" "}
        </span>
      ) : (
        <div style={{ paddingLeft: 20 }}>
          {items.map((item, i) => (
            <div key={i} style={{ lineHeight: 1.7 }}>
              <span style={{ color: JSON_COLORS.toggle, fontSize: 10, marginRight: 6, userSelect: "none" }}>{i}</span>
              <JsonValue value={item} depth={depth + 1} />
              {i < items.length - 1 && <span style={{ color: JSON_COLORS.bracket }}>,</span>}
            </div>
          ))}
        </div>
      )}
      <span style={{ color: JSON_COLORS.bracket }}>]</span>
    </span>
  );
}

function StepDataModal({
  step,
  onClose,
}: {
  step: EngineJobStep | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!step) return null;

  const i18nKeys = STEP_I18N_KEYS[step.stepType];
  const showInput = hasData(step.input);
  const showOutput = hasData(step.output);
  const showMeta = hasData(step.meta);

  const tabs = [
    ...(showInput ? [{ label: "Input", data: step.input }] : []),
    ...(showOutput ? [{ label: "Output", data: step.output }] : []),
    ...(showMeta ? [{ label: "Meta", data: step.meta }] : []),
  ];

  if (tabs.length === 0) return null;

  const safeTab = Math.min(tab, tabs.length - 1);
  const activeData = tabs[safeTab]?.data;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
        <DataObjectIcon sx={{ fontSize: 20, color: "primary.main" }} />
        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
          {t(i18nKeys.label)}
        </Typography>
        <Chip
          label={step.status}
          size="small"
          color={step.status === "completed" ? "success" : step.status === "failed" ? "error" : "default"}
          sx={{ ml: 1, height: 20, fontSize: 10, fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={handleCopy} size="small" title="Copy JSON" sx={{ mr: 1 }}>
          <ContentCopyIcon sx={{ fontSize: 16, color: copied ? "success.main" : "text.secondary" }} />
        </IconButton>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {tabs.length > 1 && (
          <Tabs
            value={safeTab}
            onChange={(_, v) => { setTab(v); setCopied(false); }}
            sx={{
              px: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              minHeight: 36,
              "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontSize: 13, fontWeight: 500 },
            }}
          >
            {tabs.map((tb) => (
              <Tab key={tb.label} label={tb.label} />
            ))}
          </Tabs>
        )}
        <Box
          sx={{
            p: 2.5,
            maxHeight: "65vh",
            overflow: "auto",
            bgcolor: "#1e1e1e",
            color: "#d4d4d4",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          <JsonValue value={activeData} depth={0} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export function EngineRun() {
  const { t } = useTranslation();
  const { jobId } = useParams({ strict: false }) as { jobId: string };
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const running = job ? isInProgress(job.status) : false;
  const duration = useLiveDuration(job?.createdAt ?? "", job?.completedAt, running);
  const [inspectedStep, setInspectedStep] = useState<EngineJobStep | null>(null);

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
  const activeStepI18n = activeStep ? STEP_I18N_KEYS[activeStep.stepType] : null;

  const proposalStep = steps.find(
    (s) => s.stepType === "generate_proposal" && s.status === "completed",
  );
  const proposal = (proposalStep?.output as { proposal?: ProposalData } | undefined)?.proposal;
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

      <StepDataModal step={inspectedStep} onClose={() => setInspectedStep(null)} />

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
                const step = steps.find((s) => s.stepType === pipelineStep.stepType);
                const state = getStepState(step);
                const isLast = idx === PIPELINE_STEPS.length - 1;
                const i18nKeys = STEP_I18N_KEYS[pipelineStep.stepType];
                const summary = getStepSummary(step);
                const clickable = !!step && (hasData(step.input) || hasData(step.output) || hasData(step.meta));

                return (
                  <Box key={pipelineStep.stepType} sx={{ display: "flex", gap: 1.5 }}>
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
                      <Box sx={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {state === "completed" && (
                          <CheckCircleIcon sx={{ fontSize: 26, color: "success.main", display: "block" }} />
                        )}
                        {state === "active" && (
                          <RadioButtonCheckedIcon
                            sx={{
                              fontSize: 26,
                              color: "primary.main",
                              display: "block",
                              animation: "dotPulse 2s ease-in-out infinite",
                              "@keyframes dotPulse": {
                                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                                "50%": { opacity: 0.5, transform: "scale(1.15)" },
                              },
                            }}
                          />
                        )}
                        {state === "error" && (
                          <ErrorIcon sx={{ fontSize: 26, color: "error.main", display: "block" }} />
                        )}
                        {state === "pending" && (
                          <CircleOutlinedIcon sx={{ fontSize: 26, color: "grey.300", display: "block" }} />
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
                            bgcolor: state === "completed" ? "success.main" : "grey.200",
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
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", minHeight: 26 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: state === "active" ? 700 : state === "completed" ? 500 : 400,
                            color: state === "pending" ? "text.disabled" : "text.primary",
                            fontSize: 13,
                          }}
                        >
                          {t(i18nKeys.label)}
                        </Typography>
                        {state === "active" && (
                          <CircularProgress size={14} thickness={5} />
                        )}
                        {step?.startedAt && (state === "active" || state === "completed" || state === "error") && (
                          <StepDuration step={step} />
                        )}
                        {step && (hasData(step.input) || hasData(step.output)) && (
                          <Chip
                            icon={<DataObjectIcon sx={{ fontSize: "14px !important" }} />}
                            label="JSON"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleStepClick(step); }}
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
                          color: state === "pending" ? "text.disabled" : "text.secondary",
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
                            color: state === "active" ? "primary.main" : "success.dark",
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
                onClick={() => navigate({ to: "/engine/$jobId/review", params: { jobId: job.id } })}
                sx={{ mt: 2.5, fontWeight: 700, textTransform: "none", py: 1.25 }}
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
          {/* Proposal summary card — shown once the proposal is ready */}
          {proposal && (
            <Card variant="outlined" sx={{ borderColor: "success.light" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="caption"
                  sx={{ fontSize: 11, color: "success.dark", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, mb: 1.5, display: "block" }}
                >
                  {t("pipeline.proposalSummary")}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <MetricBox value={proposal.stats?.total_test_plans ?? proposal.test_plans.length} label={t("pipeline.testPlans")} />
                  <MetricBox value={proposal.stats?.total_test_areas ?? 0} label={t("pipeline.testAreas")} />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <MetricBox value={proposal.stats?.total_scenarios ?? 0} label={t("pipeline.scenarios")} />
                  <MetricBox
                    value={`${Math.round((proposal.stats?.avg_scenario_confidence ?? 0) * 100)}%`}
                    label={t("pipeline.avgConfidence")}
                  />
                </Stack>

                {proposal.coverage_gaps && proposal.coverage_gaps.length > 0 && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 1.5 }}>
                    <WarningAmberOutlinedIcon sx={{ fontSize: 15, color: "warning.main" }} />
                    <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
                      {t("pipeline.coverageGaps", { count: proposal.coverage_gaps.length })}
                    </Typography>
                  </Stack>
                )}

                {topPlans.length > 0 && (
                  <>
                    <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, mt: 2, mb: 1 }}>
                      {t("pipeline.topPlans")}
                    </Typography>
                    <Stack spacing={0.75}>
                      {topPlans.map((plan) => {
                        const scenarioCount = (plan.test_areas ?? []).reduce(
                          (sum, a) => sum + (a.scenarios?.length ?? 0),
                          0,
                        );
                        return (
                          <Stack key={plan.id} direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="caption" noWrap sx={{ fontSize: 12, flex: 1, minWidth: 0 }}>
                              {plan.name}
                            </Typography>
                            {scenarioCount > 0 && (
                              <Chip label={scenarioCount} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600 }} />
                            )}
                            <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: "success.dark", fontWeight: 600, flexShrink: 0 }}>
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
                  sx={{ fontWeight: 700, fontSize: 14, color: "primary.main", mb: 0.25 }}
                >
                  {t(activeStepI18n.label)}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
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
