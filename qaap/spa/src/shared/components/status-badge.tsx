import { Chip, type ChipProps } from "@mui/material";

const STATUS_MAP: Record<string, { label: string; color: ChipProps["color"] }> =
  {
    approved: { label: "Approved", color: "success" },
    review: { label: "In Review", color: "warning" },
    generating: { label: "Generating", color: "primary" },
    draft: { label: "Draft", color: "default" },
    archived: { label: "Archived", color: "default" },
    passed: { label: "Passed", color: "success" },
    failed: { label: "Failed", color: "error" },
    pending: { label: "Pending", color: "warning" },
    rejected: { label: "Rejected", color: "error" },
    connected: { label: "Connected", color: "success" },
    not_configured: { label: "Not Configured", color: "default" },
    error: { label: "Error", color: "error" },
  };

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
}
