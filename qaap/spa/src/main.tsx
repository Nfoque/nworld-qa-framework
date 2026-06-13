import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./shared/i18n/i18n";
import { AuthProvider } from "./shared/auth/auth-provider";
import { TenantProvider } from "./shared/tenant/tenant-provider";
import { ThemedApp } from "./themed-app";

const queryClient = new QueryClient();

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
