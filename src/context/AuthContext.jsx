import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  SESSION_EXPIRED_EVENT,
  authFetch,
  clearTokens,
  createOAuthState,
  getRefreshToken,
  hasSession,
  setTokens,
} from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasSession);

  useEffect(() => {
    if (!hasSession()) return;
    const ctrl = new AbortController();
    authFetch("/api/auth/me", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => {})
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(() => {
    window.location.assign(`/api/auth/google?state=${createOAuthState()}`);
  }, []);

  const completeLogin = useCallback(async (tokens) => {
    setTokens(tokens);
    const res = await authFetch("/api/auth/me");
    if (!res.ok) {
      clearTokens();
      throw new Error("Could not load your account");
    }
    setUser((await res.json()).user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    setUser(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, completeLogin, logout }),
    [user, loading, login, completeLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
