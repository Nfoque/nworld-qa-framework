import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  useCreateConnector,
  useUpdateConnector,
} from "./connector-list.service";
import type { Connector } from "./connector-list.types";

interface GitHubConfig {
  owner: string;
  repositories: string;
}

interface ConfigureConnectorDialogProps {
  connector: Connector;
  open: boolean;
  onClose: () => void;
}

export function ConfigureConnectorDialog({
  connector,
  open,
  onClose,
}: ConfigureConnectorDialogProps) {
  const isNew = connector.id === null;
  const createConnector = useCreateConnector();
  const updateConnector = useUpdateConnector();
  const isPending = createConnector.isPending || updateConnector.isPending;
  const mutationError = createConnector.error || updateConnector.error;

  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>({
    owner: (connector.config.owner as string) ?? "",
    repositories: Array.isArray(connector.config.repositories)
      ? (connector.config.repositories as string[]).join(", ")
      : "",
  });

  const canSubmit = token.trim().length > 0 && config.owner.trim().length > 0;

  function handleSave() {
    const repositories = config.repositories
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const configPayload = { owner: config.owner.trim(), repositories };
    const credentials = { token: token.trim() };

    if (isNew) {
      createConnector.mutate(
        {
          connectorId: connector.connectorId,
          category: connector.category,
          displayName: connector.name,
          description: connector.description,
          config: configPayload,
          credentials,
        },
        { onSuccess: onClose },
      );
    } else {
      updateConnector.mutate(
        {
          id: connector.id as string,
          config: configPayload,
          credentials,
        },
        { onSuccess: onClose },
      );
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            Configure {connector.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            {connector.description}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Personal Access Token"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type={showToken ? "text" : "password"}
            required
            fullWidth
            size="small"
            helperText="Requires 'repo' scope. Generate at GitHub → Settings → Developer settings → Personal access tokens."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                    >
                      {showToken ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Owner"
            placeholder="organization or username"
            value={config.owner}
            onChange={(e) => setConfig({ ...config, owner: e.target.value })}
            required
            fullWidth
            size="small"
            helperText="GitHub organization or username that owns the repositories."
          />

          <TextField
            label="Repositories"
            placeholder="repo-a, repo-b (leave empty for all)"
            value={config.repositories}
            onChange={(e) =>
              setConfig({ ...config, repositories: e.target.value })
            }
            fullWidth
            size="small"
            helperText="Comma-separated list of repository names. Leave empty to include all repositories from the owner."
          />

          {mutationError && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {(mutationError as Error).message ??
                "Failed to save configuration."}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSubmit || isPending}
          size="small"
        >
          {isPending ? "Saving..." : isNew ? "Connect" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
