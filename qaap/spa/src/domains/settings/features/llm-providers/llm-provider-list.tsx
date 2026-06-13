import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfigureLlmProviderDialog } from "./configure-llm-provider-dialog";
import { LlmProviderCard } from "./llm-provider-card";
import {
  useLlmProviders,
  useTestLlmProvider,
  useUpdateModelMatrix,
} from "./llm-provider.service";
import type { LlmProvider, ModelMatrix } from "./llm-provider.types";
import { ModelMatrixEditor } from "./model-matrix-editor";

import { EmptyState } from "@/shared/components/empty-state";
import { useSnackbar } from "@/shared/components/snackbar-provider";
import { FILTER_TABS_SX } from "@/shared/theme/tab-styles";

type ActiveTab = "providers" | "matrix" | "usage";

export function LlmProviderList() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("providers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider | null>(
    null,
  );
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data, isLoading, error } = useLlmProviders();
  const providers = data?.providers ?? [];
  const modelMatrix = data?.matrix ?? {};
  const testProvider = useTestLlmProvider();
  const updateMatrix = useUpdateModelMatrix();
  const { showSnackbar } = useSnackbar();

  function handleConfigure(provider: LlmProvider) {
    setSelectedProvider(provider);
    setDialogOpen(true);
  }

  function handleTest(provider: LlmProvider) {
    if (!provider.id) return;
    setTestingId(provider.id);
    testProvider.mutate(
      {
        providerId: provider.id,
        providerName: provider.providerName,
        baseUrl: provider.baseUrl,
        apiKey: "",
      },
      {
        onSuccess: (result) => {
          setTestingId(null);
          if (result.success) {
            showSnackbar(
              t("llmProviders.dialog.testSuccess", {
                count: result.models.length,
              }),
              "success",
            );
          } else {
            showSnackbar(
              result.error ?? t("llmProviders.card.testFailed"),
              "error",
            );
          }
        },
        onError: () => {
          setTestingId(null);
          showSnackbar(t("llmProviders.card.testFailed"), "error");
        },
      },
    );
  }

  function handleSaveMatrix(matrix: ModelMatrix) {
    updateMatrix.mutate(matrix, {
      onSuccess: () => showSnackbar(t("llmProviders.matrix.saved"), "success"),
      onError: () => showSnackbar(t("llmProviders.matrix.saveError"), "error"),
    });
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          {t("llmProviders.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t("llmProviders.subtitle")}
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, val: ActiveTab) => setActiveTab(val)}
        sx={FILTER_TABS_SX}
      >
        <Tab label={t("llmProviders.tabs.providers")} value="providers" />
        <Tab label={t("llmProviders.tabs.matrix")} value="matrix" />
        <Tab label={t("llmProviders.tabs.usage")} value="usage" />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("llmProviders.loadError")}
        </Alert>
      )}

      {!isLoading && !error && activeTab === "providers" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 1.5,
          }}
        >
          {providers.map((provider) => (
            <LlmProviderCard
              key={provider.providerName}
              provider={provider}
              onConfigure={handleConfigure}
              onTest={handleTest}
              testing={testingId === provider.id}
            />
          ))}
        </Box>
      )}

      {!isLoading && !error && activeTab === "matrix" && (
        <ModelMatrixEditor
          providers={providers}
          matrix={modelMatrix}
          onSave={handleSaveMatrix}
          saving={updateMatrix.isPending}
          onGoToProviders={() => setActiveTab("providers")}
        />
      )}

      {!isLoading && !error && activeTab === "usage" && (
        <EmptyState
          icon={
            <BarChartOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
          }
          title={t("llmProviders.usage.comingSoonTitle")}
          description={t("llmProviders.usage.comingSoon")}
          action={
            <Button
              component={Link}
              to="/pipelines"
              variant="contained"
              size="small"
            >
              {t("llmProviders.usage.goToPipelines")}
            </Button>
          }
        />
      )}

      <ConfigureLlmProviderDialog
        key={selectedProvider?.id ?? (dialogOpen ? "new" : "closed")}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        provider={selectedProvider}
      />
    </Box>
  );
}
