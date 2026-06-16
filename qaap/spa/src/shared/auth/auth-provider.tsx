import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { UserProfile } from "./auth.types";

import { supabase, invokeFunction } from "@/shared/config/supabase";

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncGoogleAvatar(providerToken: string) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${providerToken}` },
      });
      if (!res.ok) return;
      const info = await res.json();
      if (info.picture) {
        await invokeFunction("update-avatar", {
          method: "POST",
          body: { avatarUrl: info.picture },
        });
      }
    } catch {
      /* best-effort */
    }
  }

  const loadProfile = useCallback(async (providerToken?: string | null) => {
    try {
      const data = await invokeFunction<UserProfile>("get-profile");
      if (!data.avatarUrl && providerToken) {
        await syncGoogleAvatar(providerToken);
        const refreshed = await invokeFunction<UserProfile>("get-profile");
        setProfile(refreshed);
      } else {
        setProfile(data);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session)
        loadProfile(session.provider_token).finally(() => setLoading(false));
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        scopes: "openid email profile",
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
