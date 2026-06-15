import { Box, Typography } from "@mui/material";

import { getConfidenceHex } from "./proposal-review.utils";

export function ConfidenceIndicator({
  value,
  size = "small",
}: {
  value: number;
  size?: "small" | "medium";
}) {
  const color = getConfidenceHex(value);
  const dotSize = size === "small" ? 6 : 8;
  const fontSize = size === "small" ? 11 : 12;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        flexShrink: 0,
        verticalAlign: "text-top",
        mr: 0.5,
        py: "3px",
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-block",
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography
        component="span"
        sx={{ fontSize, fontWeight: 600, color, lineHeight: 1 }}
      >
        {Math.round(value * 100)}%
      </Typography>
    </Box>
  );
}
