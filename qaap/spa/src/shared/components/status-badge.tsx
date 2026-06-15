import { Chip, type ChipProps } from "@mui/material";
import { useTranslation } from "react-i18next";

const STATUS_COLORS: Record<string, ChipProps["color"]> = {
  approved: "success",
  review: "warning",
  generating: "primary",
  draft: "default",
  archived: "default",
  passed: "success",
  failed: "error",
  pending: "warning",
  rejected: "error",
  modified: "info",
  connected: "success",
  not_configured: "default",
  error: "error",
};

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const { t } = useTranslation();
  const color = STATUS_COLORS[status] ?? ("default" as const);
  const label = t(`status.${status}`, status);
  return <Chip label={label} color={color} size={size} />;
}
