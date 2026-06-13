import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/shared/auth/auth-provider";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { AppLayout } from "@/shared/layout/app-layout";

export function AuthenticatedGuard() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [loading, session, navigate]);

  if (loading || !session) return <LoadingScreen />;

  return <AppLayout />;
}
