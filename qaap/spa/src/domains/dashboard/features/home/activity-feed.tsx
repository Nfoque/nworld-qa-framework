import { Box, Stack, Typography } from "@mui/material";

import type { ActivityItem } from "./home.types";

const STATUS_COLORS: Record<string, string> = {
  success: "#16A34A",
  info: "#217BEE",
  warning: "#EC683E",
  error: "#D13B5F",
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Stack spacing={0}>
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            py: 1.25,
            borderBottom: i < items.length - 1 ? "1px solid" : "none",
            borderColor: "grey.100",
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: STATUS_COLORS[item.status] ?? STATUS_COLORS.info,
              mt: 0.75,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {item.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.time}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
