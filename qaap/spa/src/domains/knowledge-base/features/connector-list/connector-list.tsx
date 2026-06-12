import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
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

import { ConnectorCard } from "./connector-card";
import { useConnectors } from "./connector-list.service";
import type { UiConnectorStatus } from "./connector-list.types";

import { StatCard } from "@/shared/components/stat-card";

type FilterTab = "all" | UiConnectorStatus;

export function ConnectorList() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: connectors = [], isLoading, error } = useConnectors();

  const connectedCount = connectors.filter(
    (c) => c.status === "connected",
  ).length;
  const needsSetupCount = connectors.filter(
    (c) => c.status === "not_configured",
  ).length;
  const errorCount = connectors.filter((c) => c.status === "error").length;

  const filtered =
    filter === "all"
      ? connectors
      : connectors.filter((c) => c.status === filter);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          {t("connectors.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t("connectors.subtitle")}
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
          label={t("connectors.totalConnectors")}
          value={connectors.length}
          subtitle={t("connectors.active", { count: connectedCount })}
          icon={CableOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("connectors.connected")}
          value={connectedCount}
          icon={CheckCircleOutlinedIcon}
          color="#16A34A"
        />
        <StatCard
          label={t("connectors.needsSetup")}
          value={needsSetupCount}
          icon={SettingsOutlinedIcon}
          color="#82858D"
        />
        <StatCard
          label={t("connectors.errors")}
          value={errorCount}
          subtitle={errorCount > 0 ? t("connectors.needsAttention") : undefined}
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
        <Tab label={t("connectors.tabAll")} value="all" />
        <Tab label={t("connectors.tabConnected")} value="connected" />
        <Tab label={t("connectors.tabNotConfigured")} value="not_configured" />
        <Tab label={t("connectors.tabErrors")} value="error" />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("connectors.loadError")}
        </Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CableOutlinedIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography variant="body1" color="text.secondary">
            {filter === "all"
              ? t("connectors.emptyAll")
              : t("connectors.emptyFiltered")}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 1.5,
        }}
      >
        {filtered.map((connector) => (
          <ConnectorCard key={connector.connectorId} connector={connector} />
        ))}
      </Box>
    </Box>
  );
}
