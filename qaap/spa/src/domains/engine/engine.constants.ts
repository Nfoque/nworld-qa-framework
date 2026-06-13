import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";

import type { JobStatus } from "./features/engine-run/engine-run.types";

export const STATUS_LABELS: Record<
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

export const CONNECTOR_ICONS: Record<string, React.ElementType> = {
  github: GitHubIcon,
  jira: BugReportOutlinedIcon,
  confluence: DescriptionOutlinedIcon,
};

export const DEFAULT_CONNECTOR_ICON = SourceOutlinedIcon;
