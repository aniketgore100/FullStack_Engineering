import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FullScreenLoader } from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { consumeOAuthState } from "../lib/auth";

export default function AuthCallback() {
  const { completeLogin } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; 
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const expected = consumeOAuthState();
    window.history.replaceState(null, "", window.location.pathname); 
    const fail = (code) => navigate(`/?auth_error=${code}`, { replace: true });

    if (!expected || params.get("state") !== expected) return fail("invalid_state");
    if (params.get("error")) return fail(params.get("error"));

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return fail("failed");

    completeLogin({ accessToken, refreshToken })
      .then(() => navigate("/app", { replace: true }))
      .catch(() => fail("failed"));
  }, [completeLogin, navigate]);

  return <FullScreenLoader />;
}
