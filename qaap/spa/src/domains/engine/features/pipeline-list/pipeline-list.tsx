import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import {
  Alert,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PipelineCard } from "./pipeline-card";
import { isInProgress, useJobs } from "./pipeline-list.service";
import { PipelineListEmpty } from "./pipeline-list-empty";

import { StatCard } from "@/shared/components/stat-card";

type FilterTab = "all" | "in_progress" | "completed" | "failed";

export function PipelineList() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: jobs = [], isLoading, error } = useJobs();

  const inProgressCount = jobs.filter((j) => isInProgress(j.status)).length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  const filtered = jobs.filter((j) => {
    if (filter === "all") return true;
    if (filter === "in_progress") return isInProgress(j.status);
    if (filter === "completed") return j.status === "completed";
    return j.status === "failed";
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          {t("pipelines.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t("pipelines.subtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard
          label={t("pipelines.totalPipelines")}
          value={jobs.length}
          icon={AccountTreeOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("pipelines.inProgress")}
          value={inProgressCount}
          icon={HourglassTopOutlinedIcon}
          color="#EC683E"
        />
        <StatCard
          label={t("pipelines.completed")}
          value={completedCount}
          icon={CheckCircleOutlinedIcon}
          color="#16A34A"
        />
        <StatCard
          label={t("pipelines.failed")}
          value={failedCount}
          icon={ErrorOutlineOutlinedIcon}
          color="#D13B5F"
        />
      </Box>

      <Tabs
        value={filter}
        onChange={(_, val: FilterTab) => setFilter(val)}
        sx={{
          mb: 2.5,
          minHeight: 36,
          "& .MuiTab-root": {
            minHeight: 36,
            textTransform: "none",
            fontSize: 13,
            fontWeight: 500,
            py: 0,
          },
          "& .MuiTabs-indicator": { height: 2 },
        }}
      >
        <Tab label={t("pipelines.tabAll")} value="all" />
        <Tab label={t("pipelines.tabInProgress")} value="in_progress" />
        <Tab label={t("pipelines.tabCompleted")} value="completed" />
        <Tab label={t("pipelines.tabFailed")} value="failed" />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("pipelines.loadError")}
        </Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <PipelineListEmpty isFiltered={filter !== "all"} />
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filtered.map((job) => (
          <PipelineCard key={job.id} job={job} />
        ))}
      </Box>
    </Box>
  );
}
