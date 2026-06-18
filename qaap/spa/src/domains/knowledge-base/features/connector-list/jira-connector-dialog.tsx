import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
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
import type {
  Connector,
  JiraProject,
  JiraTestResult,
} from "./connector-list.types";

interface JiraConnectorDialogProps {
  connector: Connector;
  onClose: () => void;
}

export function JiraConnectorDialog({
  connector,
  onClose,
}: JiraConnectorDialogProps) {
  const { t } = useTranslation();
  const isNew = connector.id === null;
  const hasStoredCredentials = !isNew;
  const createConnector = useCreateConnector();
  const updateConnector = useUpdateConnector();
  const testConnector = useTestConnector();
  const isSaving = createConnector.isPending || updateConnector.isPending;
  const saveError = createConnector.error || updateConnector.error;

  const existingProjects = connector.config.selectedProjects;
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [credentialsChanged, setCredentialsChanged] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [validatedUser, setValidatedUser] = useState<string | null>(null);
  const [availableProjects, setAvailableProjects] = useState<JiraProject[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(() =>
    Array.isArray(existingProjects)
      ? new Set(existingProjects as string[])
      : new Set(),
  );
  const [search, setSearch] = useState("");

  const isValidated = validatedUser !== null;

  useEffect(() => {
    if (!hasStoredCredentials) return;
    testConnector.mutate(
      { connectorId: "jira" },
      {
        onSuccess: (data) => {
          const result = data.result as unknown as JiraTestResult;
          if (result.valid) {
            setValidatedUser(result.displayName ?? result.email ?? null);
            setAvailableProjects(result.projects);
          }
        },
      },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleValidate() {
    testConnector.mutate(
      {
        connectorId: "jira",
        credentials: {
          baseUrl: baseUrl.trim(),
          email: email.trim(),
          apiToken: apiToken.trim(),
        },
      },
      {
        onSuccess: (data) => {
          const result = data.result as unknown as JiraTestResult;
          if (result.valid) {
            setValidatedUser(result.displayName ?? result.email ?? null);
            setAvailableProjects(result.projects);
          }
        },
      },
    );
  }

  function handleCredentialChange() {
    setCredentialsChanged(true);
    if (isValidated) {
      setValidatedUser(null);
      setAvailableProjects([]);
      testConnector.reset();
    }
  }

  function toggleProject(key: string) {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleSave() {
    const config = { selectedProjects: Array.from(selectedProjects) };

    if (isNew) {
      createConnector.mutate(
        {
          connectorId: connector.connectorId,
          category: connector.category,
          displayName: connector.name,
          description: connector.description,
          config,
          credentials: {
            baseUrl: baseUrl.trim(),
            email: email.trim(),
            apiToken: apiToken.trim(),
          },
        },
        { onSuccess: onClose },
      );
    } else {
      const payload: Record<string, unknown> = {
        id: connector.id as string,
        config,
      };
      if (credentialsChanged && baseUrl.trim() && email.trim() && apiToken.trim()) {
        payload.credentials = {
          baseUrl: baseUrl.trim(),
          email: email.trim(),
          apiToken: apiToken.trim(),
        };
      }
      updateConnector.mutate(
        payload as unknown as Parameters<typeof updateConnector.mutate>[0],
        { onSuccess: onClose },
      );
    }
  }

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return availableProjects;
    const q = search.toLowerCase();
    return availableProjects.filter(
      (p) =>
        p.key.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [availableProjects, search]);

  const canSave = isValidated && selectedProjects.size > 0;
  const testResult = testConnector.data?.result as JiraTestResult | undefined;

  return (
    <>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {hasStoredCredentials && !credentialsChanged ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {t("jiraDialog.credentialsSaved")}{" "}
              <Box
                component="a"
                onClick={() => {
                  setCredentialsChanged(true);
                  setValidatedUser(null);
                  setAvailableProjects([]);
                  testConnector.reset();
                }}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {t("jiraDialog.replaceCredentials")}
              </Box>
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1}>
                <TextField
                  label={t("jiraDialog.baseUrlLabel")}
                  placeholder="https://yourteam.atlassian.net"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    handleCredentialChange();
                  }}
                  required
                  size="small"
                  disabled={testConnector.isPending}
                  sx={{ flex: 3 }}
                />
                <TextField
                  label={t("jiraDialog.emailLabel")}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleCredentialChange();
                  }}
                  required
                  size="small"
                  disabled={testConnector.isPending}
                  sx={{ flex: 2 }}
                />
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "flex-start" }}
              >
                <TextField
                  label={t("jiraDialog.apiTokenLabel")}
                  placeholder="ATATT3xFf..."
                  value={apiToken}
                  onChange={(e) => {
                    setApiToken(e.target.value);
                    handleCredentialChange();
                  }}
                  type={showToken ? "text" : "password"}
                  required
                  fullWidth
                  size="small"
                  disabled={testConnector.isPending}
                  helperText={t("jiraDialog.apiTokenHelper")}
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
                  disabled={
                    !baseUrl.trim() ||
                    !email.trim() ||
                    !apiToken.trim() ||
                    testConnector.isPending
                  }
                  sx={{ mt: "1px", minWidth: 90, height: 40 }}
                >
                  {testConnector.isPending
                    ? t("configureDialog.validating")
                    : t("configureDialog.validate")}
                </Button>
              </Stack>
            </Stack>
          )}

          {hasStoredCredentials &&
            !credentialsChanged &&
            testConnector.isPending && (
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
                  {t("jiraDialog.loadingProjects")}
                </Typography>
              </Stack>
            )}

          {testConnector.isError && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {t("jiraDialog.connectionError")}
            </Alert>
          )}
          {testConnector.isSuccess && !testResult?.valid && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {testResult?.error ?? t("jiraDialog.invalidCredentials")}
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
                  {t("jiraDialog.projectsAccessible", {
                    count: availableProjects.length,
                  })}
                </Typography>
              </Stack>

              <TextField
                placeholder={t("jiraDialog.searchProjects")}
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
                  {filteredProjects.map((project) => (
                    <ListItemButton
                      key={project.key}
                      onClick={() => toggleProject(project.key)}
                      sx={{ py: 0.75 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          checked={selectedProjects.has(project.key)}
                          size="small"
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: "center" }}
                          >
                            {project.avatarUrl && (
                              <Box
                                component="img"
                                src={project.avatarUrl}
                                alt=""
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 0.5,
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, fontSize: 13 }}
                            >
                              {project.key}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: 13 }}
                            >
                              {project.name}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  ))}
                  {filteredProjects.length === 0 && (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 13 }}
                      >
                        {t("jiraDialog.noProjectsMatch")}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Box>

              {selectedProjects.size > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 12 }}
                >
                  {t("jiraDialog.projectsSelected", {
                    count: selectedProjects.size,
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
    </>
  );
}
