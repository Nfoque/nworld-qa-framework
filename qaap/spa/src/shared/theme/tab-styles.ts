import type { SxProps, Theme } from "@mui/material";

export const FILTER_TABS_SX: SxProps<Theme> = {
  mb: 2.5,
  minHeight: 36,
  "& .MuiTab-root": {
    minHeight: 36,
    textTransform: "none",
    fontSize: 13,
    fontWeight: 500,
    py: 0,
  },
  "& .MuiTabs-indicator": { height: 2 },
};
