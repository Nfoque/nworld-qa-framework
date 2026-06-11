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

import { ConnectorCard } from "./connector-card";
import { useConnectors } from "./connector-list.service";
import type { UiConnectorStatus } from "./connector-list.types";

import { StatCard } from "@/shared/components/stat-card";

type FilterTab = "all" | UiConnectorStatus;

export function ConnectorList() {
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
          Connectors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Connect your tools and data sources to provide context for AI-powered
          test generation.
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
          label="Total Connectors"
          value={connectors.length}
          subtitle={`${connectedCount} active`}
          icon={CableOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label="Connected"
          value={connectedCount}
          icon={CheckCircleOutlinedIcon}
          color="#16A34A"
        />
        <StatCard
          label="Needs Setup"
          value={needsSetupCount}
          icon={SettingsOutlinedIcon}
          color="#82858D"
        />
        <StatCard
          label="Errors"
          value={errorCount}
          subtitle={errorCount > 0 ? "Needs attention" : undefined}
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
        <Tab label="All" value="all" />
        <Tab label="Connected" value="connected" />
        <Tab label="Not Configured" value="not_configured" />
        <Tab label="Errors" value="error" />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load connectors. Please try again.
        </Alert>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CableOutlinedIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography variant="body1" color="text.secondary">
            {filter === "all"
              ? "No connectors configured yet. Add your first connector to get started."
              : "No connectors match this filter."}
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
