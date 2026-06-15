import { Box, Typography } from "@mui/material";

export function MetricBox({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.25,
        borderRadius: 1,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: 10,
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
