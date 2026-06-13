import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/shared/auth/auth-provider";
import { LoginPage } from "@/shared/auth/login-page";
import { LoadingScreen } from "@/shared/components/loading-screen";

export function LoginGuard() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  if (loading) return <LoadingScreen />;
  if (session) return null;

  return <LoginPage />;
}
