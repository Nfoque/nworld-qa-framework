import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterProvider } from "@tanstack/react-router";
import { useMemo } from "react";

import { router } from "./router";
import { SnackbarProvider } from "./shared/components/snackbar-provider";
import { useTenant } from "./shared/tenant/tenant-provider";
import { createAppTheme } from "./shared/theme/theme";

export function ThemedApp() {
  const { activeBranding, isBrandingReady } = useTenant();
  const theme = useMemo(() => createAppTheme(activeBranding), [activeBranding]);

  if (!isBrandingReady) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeProvider>
  );
}
