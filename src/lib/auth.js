const ACCESS_KEY = "auth-access-token";
const REFRESH_KEY = "auth-refresh-token";
const STATE_KEY = "oauth-state";

// Random per-login value, checked again on return to prevent login CSRF.
export function createOAuthState() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const state = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  sessionStorage.setItem(STATE_KEY, state);
  return state;
}
export function consumeOAuthState() {
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return state;
}

const read = (k) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, v); } catch { /* storage unavailable */ }
};

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);
export const hasSession = () => !!read(REFRESH_KEY);

export function setTokens({ accessToken, refreshToken }) {
  write(ACCESS_KEY, accessToken);
  write(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch { /* storage unavailable */ }
}

// Fired when the refresh token is rejected, so the app can drop the user.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

let refreshing = null; // single-flight: concurrent 401s share one refresh call

export function refreshTokens() {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        setTokens(await res.json());
        return true;
      }
      if (res.status === 401 || res.status === 400) {
        clearTokens();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      return false;
    } catch {
      return false; // offline / server down: keep tokens and try again later
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// fetch with Bearer auth; on 401 it refreshes the tokens once and retries.
export async function authFetch(url, options = {}) {
  const send = () => {
    const token = getAccessToken();
    return fetch(url, {
      ...options,
      headers: { ...options.headers, ...(token && { Authorization: `Bearer ${token}` }) },
    });
  };
  const res = await send();
  if (res.status !== 401) return res;
  return (await refreshTokens()) ? send() : res;
}
