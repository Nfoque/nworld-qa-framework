import AddIcon from "@mui/icons-material/Add";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
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

import type { LlmProvider } from "./llm-provider.types";

import { StatusBadge } from "@/shared/components/status-badge";

interface LlmProviderCardProps {
  provider: LlmProvider;
  onConfigure: (provider: LlmProvider) => void;
  onTest: (provider: LlmProvider) => void;
  testing?: boolean;
}

export function LlmProviderCard({
  provider,
  onConfigure,
  onTest,
  testing,
}: LlmProviderCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isConfigured = provider.status !== "not_configured";

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        ...(provider.status === "error" && {
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
              borderRadius: 2,
              bgcolor: `${provider.color}18`,
              color: provider.color,
              mt: 0.25,
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 18,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {provider.logo}
            </Typography>
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
                {provider.displayName}
              </Typography>
              <StatusBadge status={provider.status} />
              {provider.isDefault && (
                <Chip
                  label={t("llmProviders.card.default")}
                  size="small"
                  icon={<StarIcon sx={{ fontSize: "14px !important" }} />}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: 10, height: 22 }}
                />
              )}
            </Stack>
            {provider.availableModels.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {provider.availableModels.slice(0, 4).map((model) => (
                  <Chip
                    key={model}
                    label={model}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                ))}
                {provider.availableModels.length > 4 && (
                  <Chip
                    label={`+${provider.availableModels.length - 4}`}
                    size="small"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                )}
              </Stack>
            )}
          </Box>
        </Stack>

        {provider.status === "error" && provider.statusMessage && (
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
            {provider.statusMessage}
          </Typography>
        )}

        {isConfigured && (
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
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", py: 0.25 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t("llmProviders.card.apiKey")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    fontFamily: "monospace",
                    fontSize: 11,
                  }}
                >
                  {provider.hasApiKey ? "••••••••••••" : "—"}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", py: 0.25 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t("llmProviders.card.baseUrl")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    fontFamily: "monospace",
                    fontSize: 11,
                    maxWidth: "60%",
                    textAlign: "right",
                  }}
                  noWrap
                >
                  {provider.baseUrl}
                </Typography>
              </Stack>
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
          {!isConfigured && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontSize: 12 }}
              onClick={() => onConfigure(provider)}
            >
              {t("llmProviders.card.configure")}
            </Button>
          )}
          {isConfigured && (
            <>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                sx={{ fontSize: 12 }}
                onClick={() => onTest(provider)}
                disabled={testing}
              >
                {testing
                  ? t("llmProviders.card.testing")
                  : t("llmProviders.card.testConnection")}
              </Button>
              <Button
                size="small"
                sx={{ fontSize: 12 }}
                onClick={() => onConfigure(provider)}
              >
                {t("llmProviders.card.configure")}
              </Button>
            </>
          )}
        </Stack>
        {isConfigured && (
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
    </Card>
  );
}
