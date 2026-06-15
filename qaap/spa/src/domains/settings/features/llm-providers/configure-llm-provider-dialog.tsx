import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateLlmProvider,
  useTestLlmProvider,
  useUpdateLlmProvider,
} from "./llm-provider.service";
import type { LlmProvider } from "./llm-provider.types";

interface ConfigureLlmProviderDialogProps {
  open: boolean;
  onClose: () => void;
  provider: LlmProvider | null;
}

export function ConfigureLlmProviderDialog({
  open,
  onClose,
  provider,
}: ConfigureLlmProviderDialogProps) {
  const { t } = useTranslation();

  const isEdit = !!provider?.id;

  const [baseUrl, setBaseUrl] = useState(provider?.baseUrl ?? "");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyChanged, setApiKeyChanged] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDefault, setIsDefault] = useState(provider?.isDefault ?? false);
  const [tested, setTested] = useState(
    isEdit && (provider?.hasApiKey ?? false),
  );
  const [testResult, setTestResult] = useState<{
    success: boolean;
    models: string[];
    error: string | null;
  } | null>(null);

  const createProvider = useCreateLlmProvider();
  const updateProvider = useUpdateLlmProvider();
  const testProvider = useTestLlmProvider();

  if (!provider) return null;

  const p = provider;

  function handleTest() {
    testProvider.mutate(
      {
        providerId: p.id ?? undefined,
        providerName: p.providerName,
        baseUrl,
        apiKey,
      },
      {
        onSuccess: (result) => {
          setTestResult(result);
          setTested(result.success);
        },
        onError: (err) => {
          setTestResult({
            success: false,
            models: [],
            error: err instanceof Error ? err.message : "Connection failed",
          });
        },
      },
    );
  }

  function handleSave() {
    if (isEdit && p.id) {
      const input: Record<string, unknown> = { id: p.id };
      if (baseUrl !== p.baseUrl) input.baseUrl = baseUrl;
      if (apiKeyChanged) input.apiKey = apiKey;
      if (isDefault !== p.isDefault) input.isDefault = isDefault;
      if (testResult?.success) input.availableModels = testResult.models;
      updateProvider.mutate(
        input as unknown as Parameters<typeof updateProvider.mutate>[0],
        { onSuccess: onClose },
      );
    } else {
      createProvider.mutate(
        {
          providerName: p.providerName,
          displayName: p.displayName,
          baseUrl,
          apiKey: apiKey || undefined,
          availableModels: testResult?.models,
          isDefault,
        },
        { onSuccess: onClose },
      );
    }
  }

  const saving = createProvider.isPending || updateProvider.isPending;
  const canSave = baseUrl && tested && !saving;

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
            {t("llmProviders.dialog.editTitle", {
              name: provider.displayName,
            })}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            {t(provider.descriptionKey)}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label={t("llmProviders.dialog.baseUrl")}
            value={baseUrl}
            onChange={(e) => {
              setBaseUrl(e.target.value);
              setTested(false);
              setTestResult(null);
            }}
            fullWidth
            size="small"
            slotProps={{
              input: {
                sx: { fontFamily: "monospace", fontSize: 13 },
              },
            }}
          />

          <TextField
            label={t("llmProviders.dialog.apiKey")}
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setApiKeyChanged(true);
              setTested(false);
              setTestResult(null);
            }}
            placeholder={
              isEdit && provider.hasApiKey
                ? t("llmProviders.dialog.apiKeySaved")
                : undefined
            }
            fullWidth
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? (
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

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleTest}
              disabled={
                !baseUrl ||
                (!apiKey && !provider.hasApiKey) ||
                testProvider.isPending
              }
              startIcon={
                testProvider.isPending ? (
                  <CircularProgress size={14} />
                ) : tested ? (
                  <CheckCircleOutlinedIcon />
                ) : undefined
              }
            >
              {t("llmProviders.dialog.testConnection")}
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  size="small"
                />
              }
              label={t("llmProviders.dialog.setDefault")}
              slotProps={{
                typography: { sx: { fontSize: 13 } },
              }}
            />
          </Stack>

          {testResult?.success && (
            <Alert severity="success">
              {t("llmProviders.dialog.testSuccess", {
                count: testResult.models.length,
              })}
            </Alert>
          )}

          {testResult && !testResult.success && (
            <Alert severity="error">
              {t("llmProviders.dialog.testError", {
                error: testResult.error,
              })}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">
          {t("llmProviders.dialog.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave}
          size="small"
        >
          {saving ? (
            <CircularProgress size={18} />
          ) : (
            t("llmProviders.dialog.save")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
