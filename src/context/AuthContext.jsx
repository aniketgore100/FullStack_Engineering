/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, onAuthLost, refreshSession, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | guest

  // on first load, try to restore the session from the refresh cookie
  useEffect(() => {
    let alive = true;
    refreshSession().then((session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setStatus(session ? "authed" : "guest");
    });
    // if a later request can't refresh, drop back to the login screen
    const off = onAuthLost(() => {
      setUser(null);
      setStatus("guest");
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", undefined, { auth: false });
    } catch {
      // even if the request fails, sign out locally
    }
    setAccessToken(null);
    setUser(null);
    setStatus("guest");
  }, []);

  const value = useMemo(
    () => ({ user, status, logout }),
    [user, status, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
