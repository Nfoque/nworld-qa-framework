import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateConnector,
  useTestConnector,
  useUpdateConnector,
} from "./connector-list.service";
import type { Connector, GitHubRepo } from "./connector-list.types";

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
  const { t } = useTranslation();
  const isNew = connector.id === null;
  const hasStoredToken = !isNew;
  const createConnector = useCreateConnector();
  const updateConnector = useUpdateConnector();
  const testConnector = useTestConnector();
  const isSaving = createConnector.isPending || updateConnector.isPending;
  const saveError = createConnector.error || updateConnector.error;

  const existingRepos = connector.config.selectedRepos;
  const [token, setToken] = useState("");
  const [tokenChanged, setTokenChanged] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [validatedUser, setValidatedUser] = useState<string | null>(null);
  const [availableRepos, setAvailableRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(() =>
    Array.isArray(existingRepos)
      ? new Set(existingRepos as string[])
      : new Set(),
  );
  const [search, setSearch] = useState("");

  const isValidated = validatedUser !== null;

  useEffect(() => {
    if (!hasStoredToken) return;
    testConnector.mutate(
      { connectorId: "github" },
      {
        onSuccess: (data) => {
          if (data.result.tokenValid) {
            setValidatedUser(data.result.user ?? null);
            setAvailableRepos(data.result.repos);
          }
        },
      },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleValidate() {
    testConnector.mutate(
      { connectorId: "github", credentials: { token: token.trim() } },
      {
        onSuccess: (data) => {
          if (data.result.tokenValid) {
            setValidatedUser(data.result.user ?? null);
            setAvailableRepos(data.result.repos);
          }
        },
      },
    );
  }

  function handleTokenChange(value: string) {
    setToken(value);
    setTokenChanged(true);
    if (isValidated) {
      setValidatedUser(null);
      setAvailableRepos([]);
      testConnector.reset();
    }
  }

  function toggleRepo(fullName: string) {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });
  }

  function handleSave() {
    const config = { selectedRepos: Array.from(selectedRepos) };

    if (isNew) {
      createConnector.mutate(
        {
          connectorId: connector.connectorId,
          category: connector.category,
          displayName: connector.name,
          description: connector.description,
          config,
          credentials: { token: token.trim() },
        },
        { onSuccess: onClose },
      );
    } else {
      const payload: Record<string, unknown> = {
        id: connector.id as string,
        config,
      };
      if (tokenChanged && token.trim()) {
        payload.credentials = { token: token.trim() };
      }
      updateConnector.mutate(
        payload as unknown as Parameters<typeof updateConnector.mutate>[0],
        {
          onSuccess: onClose,
        },
      );
    }
  }

  const filteredRepos = useMemo(() => {
    if (!search.trim()) return availableRepos;
    const q = search.toLowerCase();
    return availableRepos.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [availableRepos, search]);

  const canSave = isValidated && selectedRepos.size > 0;

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
            {t("configureDialog.configureTitle", { name: connector.name })}
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
        <Stack spacing={2} sx={{ mt: 1 }}>
          {hasStoredToken && !tokenChanged ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {t("configureDialog.tokenSaved")}{" "}
              <Box
                component="a"
                onClick={() => {
                  setTokenChanged(true);
                  setValidatedUser(null);
                  setAvailableRepos([]);
                  testConnector.reset();
                }}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {t("configureDialog.replaceToken")}
              </Box>
            </Typography>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start" }}
            >
              <TextField
                label={t("configureDialog.tokenLabel")}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                type={showToken ? "text" : "password"}
                required
                fullWidth
                size="small"
                disabled={testConnector.isPending}
                helperText={t("configureDialog.tokenHelper")}
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
              <Button
                variant="outlined"
                size="small"
                onClick={handleValidate}
                disabled={!token.trim() || testConnector.isPending}
                sx={{ mt: "1px", minWidth: 90, height: 40 }}
              >
                {testConnector.isPending
                  ? t("configureDialog.validating")
                  : t("configureDialog.validate")}
              </Button>
            </Stack>
          )}

          {hasStoredToken && !tokenChanged && testConnector.isPending && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "center",
                py: 2,
              }}
            >
              <CircularProgress size={20} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 13 }}
              >
                {t("configureDialog.loadingRepos")}
              </Typography>
            </Stack>
          )}

          {testConnector.isError && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {t("configureDialog.tokenError")}
            </Alert>
          )}
          {testConnector.isSuccess && !testConnector.data.result.tokenValid && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {t("configureDialog.invalidToken")}
            </Alert>
          )}

          {isValidated && (
            <>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <CheckCircleOutlinedIcon
                  sx={{ fontSize: 16, color: "success.main" }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: 13 }}
                >
                  {validatedUser}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  ·{" "}
                  {t("configureDialog.reposAccessible", {
                    count: availableRepos.length,
                  })}
                </Typography>
              </Stack>

              <TextField
                placeholder={t("configureDialog.searchRepos")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box
                sx={{
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <List dense disablePadding>
                  {filteredRepos.map((repo) => (
                    <ListItemButton
                      key={repo.fullName}
                      onClick={() => toggleRepo(repo.fullName)}
                      sx={{ py: 0.75 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          checked={selectedRepos.has(repo.fullName)}
                          size="small"
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, fontSize: 13 }}
                          >
                            {repo.fullName}
                          </Typography>
                        }
                        secondary={
                          repo.description ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ fontSize: 11, display: "block" }}
                            >
                              {repo.description}
                            </Typography>
                          ) : null
                        }
                      />
                    </ListItemButton>
                  ))}
                  {filteredRepos.length === 0 && (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 13 }}
                      >
                        {t("configureDialog.noReposMatch")}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Box>

              {selectedRepos.size > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 12 }}
                >
                  {t("configureDialog.reposSelected", {
                    count: selectedRepos.size,
                  })}
                </Typography>
              )}
            </>
          )}

          {saveError && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {(saveError as Error).message ?? t("configureDialog.saveError")}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">
          {t("configureDialog.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || isSaving}
          size="small"
        >
          {isSaving
            ? t("configureDialog.saving")
            : isNew
              ? t("configureDialog.connect")
              : t("configureDialog.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
