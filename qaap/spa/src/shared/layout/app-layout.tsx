import { Box } from "@mui/material";
import { Outlet } from "@tanstack/react-router";

import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-context";

export function AppLayout() {
  return (
    <SidebarProvider>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
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
    </SidebarProvider>
  );
}
