import {
  faConfluence,
  faFigma,
  faGithub,
  faJira,
  faSlack,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddIcon from "@mui/icons-material/Add";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfigureConnectorDialog } from "./configure-connector-dialog";
import { useTestConnector } from "./connector-list.service";
import type { Connector } from "./connector-list.types";

import { useSnackbar } from "@/shared/components/snackbar-provider";
import { StatusBadge } from "@/shared/components/status-badge";

const CONNECTOR_ICONS: Record<string, typeof faGithub> = {
  github: faGithub,
  jira: faJira,
  figma: faFigma,
  confluence: faConfluence,
  slack: faSlack,
};

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const testConnector = useTestConnector();
  const { showSnackbar } = useSnackbar();
  const hasConfig = Object.keys(connector.config).length > 0;

  const categoryLabel = t(
    `connectorCategories.${connector.category}`,
    connector.category,
  ) as string;

  function handleTest() {
    testConnector.mutate(
      { connectorId: connector.connectorId },
      {
        onSuccess: (data) => {
          if (data.status === "active") {
            const result = data.result as Record<string, unknown>;
            let message: string;
            if (connector.connectorId === "supabase-storage") {
              const buckets = (result.buckets as unknown[]) ?? [];
              message = t("connectors.connectedBuckets", {
                name: connector.name,
                count: buckets.length,
              });
            } else {
              const repos = (result.repos as unknown[]) ?? [];
              message = t("connectors.connectedRepos", {
                name: connector.name,
                count: repos.length,
              });
            }
            showSnackbar(message, "success");
          } else {
            showSnackbar(
              data.statusMessage ?? t("connectors.testFailed"),
              "error",
            );
          }
        },
        onError: () => showSnackbar(t("connectors.testError"), "error"),
      },
    );
  }

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        ...(connector.status === "error" && {
          borderColor: "error.main",
          borderWidth: 1,
        }),
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "flex-start", mb: 1 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            {CONNECTOR_ICONS[connector.connectorId] ? (
              <FontAwesomeIcon
                icon={CONNECTOR_ICONS[connector.connectorId]}
                style={{
                  fontSize: 24,
                  color: "var(--mui-palette-text-primary)",
                }}
              />
            ) : (
              <CableOutlinedIcon
                sx={{ fontSize: 24, color: "text.secondary" }}
              />
            )}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 0.5 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, fontSize: 14 }}
                noWrap
              >
                {connector.name}
              </Typography>
              <StatusBadge status={connector.status} />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 12, mb: 1 }}
            >
              {connector.description}
            </Typography>
            <Chip
              label={categoryLabel}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          </Box>
        </Stack>

        {connector.status === "connected" && connector.lastSync && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
          >
            <CheckCircleOutlinedIcon
              sx={{ fontSize: 14, color: "success.main" }}
            />
            {t("connectors.lastSync", { date: connector.lastSync })}
          </Typography>
        )}

        {connector.status === "error" && (
          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1,
              color: "error.main",
            }}
          >
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            {connector.error}
            {connector.lastSync && <span> · {connector.lastSync}</span>}
          </Typography>
        )}

        {hasConfig && (
          <Collapse in={expanded}>
            <Box
              sx={{ mt: 1.5, p: 1.5, bgcolor: "grey.100", borderRadius: 1.5 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  display: "block",
                  mb: 0.75,
                }}
              >
                {t("connectors.configuration")}
              </Typography>
              {Object.entries(connector.config).map(([key, val]) => (
                <Stack
                  key={key}
                  direction="row"
                  sx={{ justifyContent: "space-between", py: 0.25 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {key}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      maxWidth: "60%",
                      textAlign: "right",
                    }}
                    noWrap
                  >
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Collapse>
        )}
      </CardContent>

      <CardActions
        sx={{
          px: 2,
          py: 1.25,
          borderTop: "1px solid",
          borderColor: "grey.100",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1}>
          {connector.status === "connected" && (
            <>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                sx={{ fontSize: 12 }}
                onClick={handleTest}
                disabled={testConnector.isPending}
              >
                {testConnector.isPending
                  ? t("connectors.testing")
                  : t("connectors.testConnection")}
              </Button>
              <Button
                size="small"
                sx={{ fontSize: 12 }}
                onClick={() => setConfigOpen(true)}
              >
                {t("connectors.configure")}
              </Button>
            </>
          )}
          {connector.status === "not_configured" && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontSize: 12 }}
              onClick={() => setConfigOpen(true)}
            >
              {t("connectors.configure")}
            </Button>
          )}
          {connector.status === "error" && (
            <>
              <Button
                size="small"
                variant="contained"
                startIcon={<RefreshIcon />}
                sx={{ fontSize: 12 }}
                onClick={handleTest}
                disabled={testConnector.isPending}
              >
                {testConnector.isPending
                  ? t("connectors.testing")
                  : t("connectors.retry")}
              </Button>
              <Button
                size="small"
                sx={{ fontSize: 12 }}
                onClick={() => setConfigOpen(true)}
              >
                {t("connectors.configure")}
              </Button>
            </>
          )}
        </Stack>
        {hasConfig && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        )}
      </CardActions>

      {configOpen && (
        <ConfigureConnectorDialog
          connector={connector}
          open
          onClose={() => setConfigOpen(false)}
        />
      )}
    </Card>
  );
}
