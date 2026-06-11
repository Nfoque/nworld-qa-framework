import AddIcon from "@mui/icons-material/Add";
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

import { ConfigureConnectorDialog } from "./configure-connector-dialog";
import { useTestConnector } from "./connector-list.service";
import type { Connector, ConnectorCategory } from "./connector-list.types";

import { useSnackbar } from "@/shared/components/snackbar-provider";
import { StatusBadge } from "@/shared/components/status-badge";

const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  "task-manager": "Task Manager",
  "document-source": "Document Source",
  "code-repo": "Code Repository",
  "test-runner": "Test Runner",
  notification: "Notifications",
};

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const testConnector = useTestConnector();
  const { showSnackbar } = useSnackbar();
  const hasConfig = Object.keys(connector.config).length > 0;

  function handleTest() {
    testConnector.mutate(connector.connectorId, {
      onSuccess: (data) => {
        if (data.status === "active") {
          const result = data.result as
            | { repos?: { name: string; description?: string | null }[] }
            | undefined;
          const repo = result?.repos?.[0];
          const desc = repo?.description ? ` — ${repo.description}` : "";
          showSnackbar(
            `${connector.name} connected: ${repo?.name ?? "OK"}${desc}`,
            "success",
          );
        } else {
          showSnackbar(
            data.statusMessage ?? "Connection test failed.",
            "error",
          );
        }
      },
      onError: () => showSnackbar("Failed to test connection.", "error"),
    });
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
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
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
              label={CATEGORY_LABELS[connector.category] ?? connector.category}
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
            Last sync: {connector.lastSync}
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
                Configuration
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
                {testConnector.isPending ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                size="small"
                sx={{ fontSize: 12 }}
                onClick={() => setConfigOpen(true)}
              >
                Configure
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
              Configure
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
                {testConnector.isPending ? "Testing..." : "Retry"}
              </Button>
              <Button
                size="small"
                sx={{ fontSize: 12 }}
                onClick={() => setConfigOpen(true)}
              >
                Configure
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

      <ConfigureConnectorDialog
        connector={connector}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </Card>
  );
}
