import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { LlmProvider, ModelMatrix } from "./llm-provider.types";
import { TASK_TYPES } from "./llm-provider.types";

import { EmptyState } from "@/shared/components/empty-state";

interface ModelMatrixEditorProps {
  providers: LlmProvider[];
  matrix: ModelMatrix;
  onSave: (matrix: ModelMatrix) => void;
  saving: boolean;
  onGoToProviders?: () => void;
}

interface ModelOption {
  model: string;
  provider: string;
  providerName: string;
}

export function ModelMatrixEditor({
  providers,
  matrix,
  onSave,
  saving,
  onGoToProviders,
}: ModelMatrixEditorProps) {
  const { t } = useTranslation();
  const [localMatrix, setLocalMatrix] = useState<ModelMatrix>(matrix);

  const configuredProviders = providers.filter((p) => p.status === "connected");

  const allModels: ModelOption[] = configuredProviders.flatMap((p) =>
    p.availableModels.map((m) => ({
      model: m,
      provider: p.providerName,
      providerName: p.displayName,
    })),
  );

  const modelsByProvider = configuredProviders.map((p) => ({
    provider: p.providerName,
    displayName: p.displayName,
    models: p.availableModels,
  }));

  const hasChanges = JSON.stringify(localMatrix) !== JSON.stringify(matrix);

  function handleModelChange(taskKey: string, value: string) {
    const option = allModels.find((m) => `${m.provider}::${m.model}` === value);
    if (!option) return;
    setLocalMatrix((prev) => ({
      ...prev,
      [taskKey]: { provider: option.provider, model: option.model },
    }));
  }

  if (configuredProviders.length === 0) {
    return (
      <EmptyState
        icon={
          <CableOutlinedIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
        }
        title={t("llmProviders.matrix.noProvidersTitle")}
        description={t("llmProviders.matrix.noProviders")}
        action={
          onGoToProviders && (
            <Button variant="contained" size="small" onClick={onGoToProviders}>
              {t("llmProviders.matrix.goToProviders")}
            </Button>
          )
        }
      />
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, fontSize: 14 }}
          >
            {t("llmProviders.matrix.title")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            {t("llmProviders.matrix.subtitle")}
          </Typography>
        </Box>

        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th, & td": {
              px: 2.5,
              py: 1.5,
              textAlign: "left",
              borderBottom: "1px solid",
              borderColor: "divider",
              fontSize: 13,
            },
            "& th": {
              fontWeight: 600,
              color: "text.secondary",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
          }}
        >
          <thead>
            <tr>
              <th>{t("llmProviders.matrix.task")}</th>
              <th>{t("llmProviders.matrix.description")}</th>
              <th>{t("llmProviders.matrix.assignedModel")}</th>
              <th>{t("llmProviders.matrix.provider")}</th>
            </tr>
          </thead>
          <tbody>
            {TASK_TYPES.map(({ key, labelKey, descriptionKey }) => {
              const entry = localMatrix[key];
              const currentValue = entry
                ? `${entry.provider}::${entry.model}`
                : "";
              const matchedProvider = entry
                ? configuredProviders.find(
                    (p) => p.providerName === entry.provider,
                  )
                : null;

              return (
                <tr key={key}>
                  <td>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {t(labelKey)}
                    </Typography>
                  </td>
                  <td>
                    <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                      {t(descriptionKey)}
                    </Typography>
                  </td>
                  <td>
                    <Select
                      value={currentValue}
                      onChange={(e) => handleModelChange(key, e.target.value)}
                      size="small"
                      displayEmpty
                      sx={{ minWidth: 200, fontSize: 12 }}
                    >
                      <MenuItem value="" disabled>
                        —
                      </MenuItem>
                      {modelsByProvider.map((group) => [
                        <ListSubheader
                          key={`header-${group.provider}`}
                          sx={{ fontSize: 11, fontWeight: 700 }}
                        >
                          {group.displayName}
                        </ListSubheader>,
                        ...group.models.map((model) => (
                          <MenuItem
                            key={`${group.provider}::${model}`}
                            value={`${group.provider}::${model}`}
                            sx={{ fontSize: 12, pl: 3 }}
                          >
                            {model}
                          </MenuItem>
                        )),
                      ])}
                    </Select>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 12 }}>
                      {matchedProvider?.displayName ?? "—"}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 2.5, py: 2, justifyContent: "flex-end" }}
        >
          <Button
            size="small"
            onClick={() => setLocalMatrix(matrix)}
            disabled={!hasChanges}
          >
            {t("llmProviders.matrix.reset")}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => onSave(localMatrix)}
            disabled={!hasChanges || saving}
          >
            {t("llmProviders.matrix.save")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
