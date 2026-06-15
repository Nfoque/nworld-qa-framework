import ApiOutlinedIcon from "@mui/icons-material/ApiOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WebOutlinedIcon from "@mui/icons-material/WebOutlined";
import {
  Alert,
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TestPlan } from "./test-plan-list.service";
import { useTestPlans } from "./test-plan-list.service";

import { EmptyState } from "@/shared/components/empty-state";
import { StatCard } from "@/shared/components/stat-card";

const MODALITY_ICON: Record<string, React.ReactNode> = {
  web: <LaptopMacOutlinedIcon sx={{ fontSize: 14 }} />,
  api: <ApiOutlinedIcon sx={{ fontSize: 14 }} />,
  ios: <PhoneIphoneOutlinedIcon sx={{ fontSize: 14 }} />,
  android: <PhoneIphoneOutlinedIcon sx={{ fontSize: 14 }} />,
};

const MODALITY_COLORS: Record<string, string> = {
  web: "#217BEE",
  api: "#8B5CF6",
  ios: "#EC683E",
  android: "#16A34A",
};

const HEADER_CELL_SX = {
  fontSize: 11,
  fontWeight: 600,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
} as const;

const GRID_COLUMNS = "minmax(200px, 2fr) 80px 80px 160px 90px";

function ModalityBadge({ modality }: { modality: string }) {
  const color = MODALITY_COLORS[modality] ?? "#82858D";
  const icon = MODALITY_ICON[modality] ?? <LaptopMacOutlinedIcon sx={{ fontSize: 14 }} />;
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color }}>
      {icon}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color }}>
        {modality.charAt(0).toUpperCase() + modality.slice(1)}
      </Typography>
    </Stack>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function TestPlanList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "scenarios">("name");
  const { data: plans = [], isLoading, error } = useTestPlans();

  const totalScenarios = plans.reduce((sum, p) => sum + p.scenario_count, 0);
  const modalityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plans) {
      counts[p.modality] = (counts[p.modality] ?? 0) + 1;
    }
    return counts;
  }, [plans]);

  const modalities = useMemo(() => ["all", ...new Set(plans.map((p) => p.modality))], [plans]);
  const frameworks = useMemo(() => ["all", ...new Set(plans.map((p) => p.target_framework))], [plans]);

  const filtered = useMemo(() => {
    return plans
      .filter((p) => {
        if (modalityFilter !== "all" && p.modality !== modalityFilter) return false;
        if (frameworkFilter !== "all" && p.target_framework !== frameworkFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) =>
        sortBy === "scenarios"
          ? b.scenario_count - a.scenario_count
          : a.name.localeCompare(b.name),
      );
  }, [plans, modalityFilter, frameworkFilter, search, sortBy]);

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
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", mr: 0.75 }}>{t("tables.type")}</Typography>
            {modalities.map((m) => (
              <Chip key={m} label={m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)} size="small" variant={modalityFilter === m ? "filled" : "outlined"} color={modalityFilter === m ? "primary" : "default"} onClick={() => setModalityFilter(m)} sx={{ fontSize: 12, fontWeight: modalityFilter === m ? 600 : 400 }} />
            ))}
          </Stack>
          <Box sx={{ height: 20, borderLeft: "1px solid", borderColor: "divider" }} />
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", mr: 0.75 }}>Framework</Typography>
            {frameworks.map((f) => (
              <Chip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} size="small" variant={frameworkFilter === f ? "filled" : "outlined"} color={frameworkFilter === f ? "primary" : "default"} onClick={() => setFrameworkFilter(f)} sx={{ fontSize: 12, fontWeight: frameworkFilter === f ? 600 : 400 }} />
            ))}
          </Stack>
          <Box sx={{ height: 20, borderLeft: "1px solid", borderColor: "divider" }} />
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", mr: 0.75 }}>{t("testPlans.sortBy")}</Typography>
            <Chip label="A-Z" size="small" variant={sortBy === "name" ? "filled" : "outlined"} color={sortBy === "name" ? "primary" : "default"} onClick={() => setSortBy("name")} sx={{ fontSize: 12, fontWeight: sortBy === "name" ? 600 : 400 }} />
            <Chip label={t("tables.scenarios")} size="small" variant={sortBy === "scenarios" ? "filled" : "outlined"} color={sortBy === "scenarios" ? "primary" : "default"} onClick={() => setSortBy("scenarios")} sx={{ fontSize: 12, fontWeight: sortBy === "scenarios" ? 600 : 400 }} />
          </Stack>
        </Stack>

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
          sx={{ width: 220, "& .MuiOutlinedInput-root": { fontSize: 13 } }}
        />
      </Stack>

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
          icon={<DescriptionOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />}
          title={plans.length === 0 ? t("testPlans.empty") : t("testPlans.emptyFiltered")}
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
            <Typography sx={HEADER_CELL_SX}>{t("tables.name")}</Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>{t("tables.type")}</Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>{t("tables.scenarios")}</Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>{t("testPlans.createdBy")}</Typography>
            <Typography sx={{ ...HEADER_CELL_SX, textAlign: "right" }}>{t("tables.updated")}</Typography>
          </Box>

          {filtered.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </Card>
      )}
    </Box>
  );
}

function PlanRow({ plan }: { plan: TestPlan }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: GRID_COLUMNS,
        px: 2.5,
        py: 1.75,
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "background-color 0.15s",
        "&:hover": { bgcolor: "action.hover" },
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Name + framework */}
      <Box sx={{ minWidth: 0, pr: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }} noWrap>
          {plan.name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled", textTransform: "capitalize" }}>
          {plan.target_framework}
        </Typography>
      </Box>

      {/* Modality */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ModalityBadge modality={plan.modality} />
      </Box>

      {/* Scenario count */}
      <Typography sx={{ fontWeight: 700, fontSize: 14, textAlign: "center" }}>
        {plan.scenario_count}
      </Typography>

      {/* Created by */}
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        {plan.created_by_name && (
          <>
            <Avatar
              src={plan.created_by_avatar ?? undefined}
              sx={{ width: 20, height: 20, fontSize: 9 }}
            >
              {plan.created_by_name[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
              {plan.created_by_name}
            </Typography>
          </>
        )}
      </Stack>

      {/* Updated */}
      <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "right" }}>
        {formatRelativeTime(plan.created_at)}
      </Typography>
    </Box>
  );
}
