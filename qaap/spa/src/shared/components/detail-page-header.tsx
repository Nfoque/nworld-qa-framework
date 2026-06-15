import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { STATUS_LABELS } from "@/domains/engine/engine.constants";
import type { JobStatus } from "@/domains/engine/features/engine-run/engine-run.types";

export function DetailPageHeader({
  title,
  jobId,
  status,
  createdAt,
  onBack,
  subtitle,
  action,
  statusSlot,
}: {
  title: string;
  jobId?: string;
  status?: JobStatus;
  createdAt?: string;
  onBack: () => void;
  subtitle?: ReactNode;
  action?: ReactNode;
  statusSlot?: ReactNode;
}) {
  const { t } = useTranslation();
  const statusInfo = status
    ? (STATUS_LABELS[status] ?? {
        labelKey: status,
        color: "default" as const,
      })
    : null;
  const shortId = jobId?.slice(0, 8);

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <IconButton
          onClick={onBack}
          size="small"
          sx={{ color: "text.secondary", mt: "4px" }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontSize: 22, mb: 0.25 }}
          >
            {title}
            {shortId && (
              <>
                {" "}
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: 22,
                    fontFamily: "monospace",
                    color: "text.secondary",
                  }}
                >
                  #{shortId}
                </Typography>
              </>
            )}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {createdAt && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 13 }}
              >
                {new Date(createdAt).toLocaleString()}
              </Typography>
            )}
            {subtitle}
          </Stack>
        </Box>
      </Stack>
      {action ??
        statusSlot ??
        (statusInfo && (
          <Chip
            label={t(statusInfo.labelKey)}
            color={statusInfo.color}
            sx={{ fontWeight: 600, fontSize: 13, height: 32, px: 1 }}
          />
        ))}
    </Stack>
  );
}
