import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./router";
import { AuthProvider } from "./shared/auth/auth-provider";
import { SnackbarProvider } from "./shared/components/snackbar-provider";
import { TenantProvider } from "./shared/tenant/tenant-provider";
import { theme } from "./shared/theme/theme";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <TenantProvider>
              <RouterProvider router={router} />
            </TenantProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
