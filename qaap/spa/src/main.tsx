import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";

import "./shared/i18n/i18n";
import { router } from "./router";
import { AuthProvider } from "./shared/auth/auth-provider";
import { SnackbarProvider } from "./shared/components/snackbar-provider";
import { TenantProvider, useTenant } from "./shared/tenant/tenant-provider";
import { createAppTheme } from "./shared/theme/theme";

const queryClient = new QueryClient();

function ThemedApp() {
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

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <ThemedApp />
        </TenantProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
