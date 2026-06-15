import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      {icon}
      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 13, mb: action ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: description ? 0 : 2 }}>{action}</Box>}
    </Box>
  );
}
