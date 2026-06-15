import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/shared/auth/auth-provider";
import type { TenantBranding } from "@/shared/auth/auth.types";
import {
  invokeFunction,
  setActiveTenantHeader,
} from "@/shared/config/supabase";

interface TenantListItem {
  id: string;
  slug: string;
  name: string;
  branding: TenantBranding;
  createdAt: string;
}

interface TenantState {
  activeTenantId: string | null;
  activeTenantName: string | null;
  activeBranding: TenantBranding;
  isBrandingReady: boolean;
  setActiveTenantId: (id: string) => void;
  tenants: TenantListItem[];
  isLoadingTenants: boolean;
  isSuperadmin: boolean;
}

const TenantContext = createContext<TenantState | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { profile, loading: authLoading } = useAuth();
  const isSuperadmin = profile?.role === "superadmin";
  const [overrideTenantId, setOverrideTenantId] = useState<string | null>(
    () => {
      const stored = localStorage.getItem("qaap:activeTenantId");
      if (stored) setActiveTenantHeader(stored);
      return stored;
    },
  );

  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: () =>
      invokeFunction<TenantListItem[]>("get-tenants", { method: "GET" }),
    enabled: isSuperadmin,
  });

  const effectiveOverrideId =
    overrideTenantId ??
    (isSuperadmin && tenants.length > 0 ? tenants[0].id : null);

  const queryClient = useQueryClient();
  const prevTenantId = useRef(effectiveOverrideId);

  useEffect(() => {
    setActiveTenantHeader(effectiveOverrideId);
    if (effectiveOverrideId) {
      localStorage.setItem("qaap:activeTenantId", effectiveOverrideId);
    }
    if (prevTenantId.current && prevTenantId.current !== effectiveOverrideId) {
      queryClient.resetQueries({
        predicate: (q) => q.queryKey[0] !== "tenants",
      });
    }
    prevTenantId.current = effectiveOverrideId;
  }, [effectiveOverrideId, queryClient]);

  const activeTenantId = effectiveOverrideId ?? profile?.tenantId ?? null;
  const activeTenant = tenants.find((t) => t.id === activeTenantId);
  const activeTenantName = activeTenant?.name ?? profile?.tenant?.name ?? null;
  const resolvedBranding =
    activeTenant?.branding ?? profile?.tenant?.branding ?? {};
  const activeBranding = useMemo(
    () => resolvedBranding,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      resolvedBranding.primaryColor,
      resolvedBranding.primaryColorDark,
      resolvedBranding.primaryColorLight,
    ],
  );

  const isBrandingReady =
    !authLoading && (isSuperadmin ? !isLoadingTenants : true);

  useEffect(() => {
    document.title = activeTenantName ? `QAAP - ${activeTenantName}` : "QAAP";
  }, [activeTenantName]);

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        activeTenantName,
        activeBranding,
        isBrandingReady,
        setActiveTenantId: setOverrideTenantId,
        tenants,
        isLoadingTenants,
        isSuperadmin,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
