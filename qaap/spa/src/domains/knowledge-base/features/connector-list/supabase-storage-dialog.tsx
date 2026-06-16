import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
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
  SupabaseBucket,
  SupabaseStorageTestResult,
} from "./connector-list.types";

interface SupabaseStorageDialogProps {
  connector: Connector;
  onClose: () => void;
}

export function SupabaseStorageDialog({
  connector,
  onClose,
}: SupabaseStorageDialogProps) {
  const { t } = useTranslation();
  const isNew = connector.id === null;
  const hasStoredCredentials = !isNew;
  const createConnector = useCreateConnector();
  const updateConnector = useUpdateConnector();
  const testConnector = useTestConnector();
  const isSaving = createConnector.isPending || updateConnector.isPending;
  const saveError = createConnector.error || updateConnector.error;

  const existingBuckets = connector.config.selectedBuckets;
  const [projectUrl, setProjectUrl] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [credentialsChanged, setCredentialsChanged] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null);
  const [availableBuckets, setAvailableBuckets] = useState<SupabaseBucket[]>(
    [],
  );
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(() =>
    Array.isArray(existingBuckets)
      ? new Set(existingBuckets as string[])
      : new Set(),
  );
  const [search, setSearch] = useState("");

  const isValidated = validatedUrl !== null;

  useEffect(() => {
    if (!hasStoredCredentials) return;
    testConnector.mutate(
      { connectorId: "supabase-storage" },
      {
        onSuccess: (data) => {
          const result = data.result as unknown as SupabaseStorageTestResult;
          if (result.valid) {
            setValidatedUrl(result.projectUrl ?? null);
            setAvailableBuckets(result.buckets);
          }
        },
      },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleValidate() {
    testConnector.mutate(
      {
        connectorId: "supabase-storage",
        credentials: {
          projectUrl: projectUrl.trim(),
          serviceRoleKey: serviceRoleKey.trim(),
        },
      },
      {
        onSuccess: (data) => {
          const result = data.result as unknown as SupabaseStorageTestResult;
          if (result.valid) {
            setValidatedUrl(result.projectUrl ?? null);
            setAvailableBuckets(result.buckets);
          }
        },
      },
    );
  }

  function handleCredentialChange() {
    setCredentialsChanged(true);
    if (isValidated) {
      setValidatedUrl(null);
      setAvailableBuckets([]);
      testConnector.reset();
    }
  }

  function toggleBucket(id: string) {
    setSelectedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSave() {
    const config = { selectedBuckets: Array.from(selectedBuckets) };

    if (isNew) {
      createConnector.mutate(
        {
          connectorId: connector.connectorId,
          category: connector.category,
          displayName: connector.name,
          description: connector.description,
          config,
          credentials: {
            projectUrl: projectUrl.trim(),
            serviceRoleKey: serviceRoleKey.trim(),
          },
        },
        { onSuccess: onClose },
      );
    } else {
      const payload: Record<string, unknown> = {
        id: connector.id as string,
        config,
      };
      if (credentialsChanged && projectUrl.trim() && serviceRoleKey.trim()) {
        payload.credentials = {
          projectUrl: projectUrl.trim(),
          serviceRoleKey: serviceRoleKey.trim(),
        };
      }
      updateConnector.mutate(
        payload as unknown as Parameters<typeof updateConnector.mutate>[0],
        { onSuccess: onClose },
      );
    }
  }

  const filteredBuckets = useMemo(() => {
    if (!search.trim()) return availableBuckets;
    const q = search.toLowerCase();
    return availableBuckets.filter((b) => b.name.toLowerCase().includes(q));
  }, [availableBuckets, search]);

  const canSave = isValidated && selectedBuckets.size > 0;

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
              {t("supabaseStorageDialog.credentialsSaved")}{" "}
              <Box
                component="a"
                onClick={() => {
                  setCredentialsChanged(true);
                  setValidatedUrl(null);
                  setAvailableBuckets([]);
                  testConnector.reset();
                }}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {t("supabaseStorageDialog.replaceCredentials")}
              </Box>
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              <TextField
                label={t("supabaseStorageDialog.projectUrlLabel")}
                placeholder="https://xyzproject.supabase.co"
                value={projectUrl}
                onChange={(e) => {
                  setProjectUrl(e.target.value);
                  handleCredentialChange();
                }}
                required
                fullWidth
                size="small"
                disabled={testConnector.isPending}
                helperText={t("supabaseStorageDialog.projectUrlHelper")}
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "flex-start" }}
              >
                <TextField
                  label={t("supabaseStorageDialog.serviceRoleKeyLabel")}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={serviceRoleKey}
                  onChange={(e) => {
                    setServiceRoleKey(e.target.value);
                    handleCredentialChange();
                  }}
                  type={showKey ? "text" : "password"}
                  required
                  fullWidth
                  size="small"
                  disabled={testConnector.isPending}
                  helperText={t("supabaseStorageDialog.serviceRoleKeyHelper")}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowKey(!showKey)}
                            edge="end"
                          >
                            {showKey ? (
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
                    !projectUrl.trim() ||
                    !serviceRoleKey.trim() ||
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
                  {t("supabaseStorageDialog.loadingBuckets")}
                </Typography>
              </Stack>
            )}

          {testConnector.isError && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {t("supabaseStorageDialog.connectionError")}
            </Alert>
          )}
          {testConnector.isSuccess &&
            !(testConnector.data.result as unknown as SupabaseStorageTestResult)
              .valid && (
              <Alert severity="error" sx={{ fontSize: 13 }}>
                {t("supabaseStorageDialog.invalidCredentials")}
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
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  {t("supabaseStorageDialog.bucketsAccessible", {
                    count: availableBuckets.length,
                  })}
                </Typography>
              </Stack>

              <TextField
                placeholder={t("supabaseStorageDialog.searchBuckets")}
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
                  {filteredBuckets.map((bucket) => (
                    <ListItemButton
                      key={bucket.id}
                      onClick={() => toggleBucket(bucket.id)}
                      sx={{ py: 0.75 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          checked={selectedBuckets.has(bucket.id)}
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
                            {bucket.public ? (
                              <PublicOutlinedIcon
                                sx={{ fontSize: 14, color: "text.secondary" }}
                              />
                            ) : (
                              <LockOutlinedIcon
                                sx={{ fontSize: 14, color: "text.secondary" }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, fontSize: 13 }}
                            >
                              {bucket.name}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  ))}
                  {filteredBuckets.length === 0 && (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 13 }}
                      >
                        {t("supabaseStorageDialog.noBucketsMatch")}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Box>

              {selectedBuckets.size > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 12 }}
                >
                  {t("supabaseStorageDialog.bucketsSelected", {
                    count: selectedBuckets.size,
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
