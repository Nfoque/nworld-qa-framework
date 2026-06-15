import ApiOutlinedIcon from "@mui/icons-material/ApiOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WebOutlinedIcon from "@mui/icons-material/WebOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { GRID_COLUMNS, PlanRow } from "./plan-row";
import { useTestPlans } from "./test-plan-list.service";

import { EmptyState } from "@/shared/components/empty-state";
import { StatCard } from "@/shared/components/stat-card";

const HEADER_CELL_SX = {
  fontSize: 11,
  fontWeight: 600,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
} as const;

export function TestPlanList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "project" | "scenarios">("name");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const { data: plans = [], isLoading, error } = useTestPlans();

  const totalScenarios = plans.reduce((sum, p) => sum + p.scenario_count, 0);
  const modalityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plans) {
      counts[p.modality] = (counts[p.modality] ?? 0) + 1;
    }
    return counts;
  }, [plans]);

  const modalities = useMemo(
    () => ["all", ...new Set(plans.map((p) => p.modality))],
    [plans],
  );
  const frameworks = useMemo(
    () => ["all", ...new Set(plans.map((p) => p.target_framework))],
    [plans],
  );
  const projects = useMemo(
    () => [
      "all",
      ...new Set(plans.map((p) => p.engine_job_name).filter(Boolean)),
    ],
    [plans],
  );

  const filtered = useMemo(() => {
    return plans
      .filter((p) => {
        if (modalityFilter !== "all" && p.modality !== modalityFilter)
          return false;
        if (frameworkFilter !== "all" && p.target_framework !== frameworkFilter)
          return false;
        if (
          projectFilter !== "all" &&
          p.engine_job_name !== projectFilter
        )
          return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "scenarios") return b.scenario_count - a.scenario_count;
        if (sortBy === "project")
          return (a.engine_job_name ?? "").localeCompare(b.engine_job_name ?? "") || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
  }, [plans, modalityFilter, frameworkFilter, projectFilter, search, sortBy]);

  const safePagedPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  if (safePagedPage !== page) setPage(safePagedPage);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(safePagedPage * PAGE_SIZE, (safePagedPage + 1) * PAGE_SIZE);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 22 }}>
          {t("testPlans.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t("testPlans.subtitle")}
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard
          label={t("testPlans.totalPlans")}
          value={plans.length}
          icon={DescriptionOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("testPlans.totalScenarios")}
          value={totalScenarios}
          icon={BugReportOutlinedIcon}
          color="#16A34A"
        />
        <StatCard
          label={t("testPlans.webPlans")}
          value={modalityCounts.web ?? 0}
          icon={WebOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("testPlans.apiPlans")}
          value={modalityCounts.api ?? 0}
          icon={ApiOutlinedIcon}
          color="#8B5CF6"
        />
      </Box>

      {/* Filters + Search */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", rowGap: 1, mb: 2 }}>
        {projects.length > 2 && (
          <>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
              {t("testPlans.project")}
            </Typography>
            {projects.map((p) => (
              <Chip
                key={p ?? "all"}
                label={p === "all" ? "All" : p}
                size="small"
                variant={projectFilter === p ? "filled" : "outlined"}
                color={projectFilter === p ? "primary" : "default"}
                onClick={() => setProjectFilter(p!)}
                sx={{ fontSize: 12, fontWeight: projectFilter === p ? 600 : 400 }}
              />
            ))}
          </>
        )}
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", ml: projects.length > 2 ? 1.5 : 0 }}>
          {t("tables.type")}
        </Typography>
        {modalities.map((m) => (
          <Chip
            key={m}
            label={m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
            size="small"
            variant={modalityFilter === m ? "filled" : "outlined"}
            color={modalityFilter === m ? "primary" : "default"}
            onClick={() => setModalityFilter(m)}
            sx={{ fontSize: 12, fontWeight: modalityFilter === m ? 600 : 400 }}
          />
        ))}
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", ml: 1.5 }}>
          Framework
        </Typography>
        {frameworks.map((f) => (
          <Chip
            key={f}
            label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            size="small"
            variant={frameworkFilter === f ? "filled" : "outlined"}
            color={frameworkFilter === f ? "primary" : "default"}
            onClick={() => setFrameworkFilter(f)}
            sx={{ fontSize: 12, fontWeight: frameworkFilter === f ? 600 : 400 }}
          />
        ))}
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", ml: 1.5 }}>
          {t("testPlans.sortBy")}
        </Typography>
        <Chip
          label="A-Z"
          size="small"
          variant={sortBy === "name" ? "filled" : "outlined"}
          color={sortBy === "name" ? "primary" : "default"}
          onClick={() => setSortBy("name")}
          sx={{ fontSize: 12, fontWeight: sortBy === "name" ? 600 : 400 }}
        />
        <Chip
          label={t("testPlans.project")}
          size="small"
          variant={sortBy === "project" ? "filled" : "outlined"}
          color={sortBy === "project" ? "primary" : "default"}
          onClick={() => setSortBy("project")}
          sx={{ fontSize: 12, fontWeight: sortBy === "project" ? 600 : 400 }}
        />
        <Chip
          label={t("tables.scenarios")}
          size="small"
          variant={sortBy === "scenarios" ? "filled" : "outlined"}
          color={sortBy === "scenarios" ? "primary" : "default"}
          onClick={() => setSortBy("scenarios")}
          sx={{ fontSize: 12, fontWeight: sortBy === "scenarios" ? 600 : 400 }}
        />
        <TextField
          size="small"
          placeholder={t("testPlans.searchPlans")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 200, ml: "auto", "& .MuiOutlinedInput-root": { fontSize: 13 } }}
        />
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("testPlans.loadError")}
        </Alert>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          icon={
            <DescriptionOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
          }
          title={
            plans.length === 0
              ? t("testPlans.empty")
              : t("testPlans.emptyFiltered")
          }
        />
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: GRID_COLUMNS,
              px: 2.5,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography sx={HEADER_CELL_SX}>
              {t("testPlans.project")}
            </Typography>
            <Typography sx={HEADER_CELL_SX}>{t("tables.name")}</Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>
              {t("tables.type")}
            </Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>
              {t("tables.scenarios")}
            </Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>
              {t("testPlans.createdBy")}
            </Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "right" }}>
              {t("tables.updated")}
            </Typography>
          </Box>

          {paginated.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mt: 2,
          }}
        >
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
          </Typography>
          <IconButton
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
