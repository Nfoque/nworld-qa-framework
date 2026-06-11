import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Badge, Box, IconButton, Toolbar } from "@mui/material";
import { Outlet } from "@tanstack/react-router";

import { Sidebar } from "./sidebar";

export function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="header"
          sx={{
            height: 52,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 2.5,
            flexShrink: 0,
          }}
        >
          <Toolbar
            disableGutters
            sx={{ gap: 0.5, minHeight: "auto !important" }}
          >
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <SearchOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <Badge variant="dot" color="error" overlap="circular">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Toolbar>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "background.default",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
