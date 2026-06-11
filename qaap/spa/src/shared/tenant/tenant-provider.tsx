import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/shared/auth/auth-provider";
import {
  invokeFunction,
  setActiveTenantHeader,
} from "@/shared/config/supabase";

interface TenantListItem {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

interface TenantState {
  activeTenantId: string | null;
  activeTenantName: string | null;
  setActiveTenantId: (id: string) => void;
  tenants: TenantListItem[];
  isLoadingTenants: boolean;
  isSuperadmin: boolean;
}

const TenantContext = createContext<TenantState | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
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

  useEffect(() => {
    setActiveTenantHeader(effectiveOverrideId);
    if (effectiveOverrideId) {
      const prev = localStorage.getItem("qaap:activeTenantId");
      localStorage.setItem("qaap:activeTenantId", effectiveOverrideId);
      if (prev && prev !== effectiveOverrideId) {
        window.location.reload();
      }
    }
  }, [effectiveOverrideId]);

  const activeTenantId = effectiveOverrideId ?? profile?.tenantId ?? null;
  const activeTenantName =
    tenants.find((t) => t.id === activeTenantId)?.name ??
    profile?.tenant?.name ??
    null;

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        activeTenantName,
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
