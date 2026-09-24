// Tiny fetch wrapper. The access token lives in memory only (never in
// localStorage), and the refresh token is an httpOnly cookie the browser
// sends by itself. On a 401 we refresh once and retry the request.

let accessToken = null;
let refreshing = null; // shared promise so parallel 401s trigger one refresh
const authLostListeners = new Set();

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data ?? {}; // full error body, e.g. { suggestions }
  }
}

export const setAccessToken = (token) => {
  accessToken = token;
};

// called when the session can't be recovered (refresh failed)
export const onAuthLost = (fn) => {
  authLostListeners.add(fn);
  return () => authLostListeners.delete(fn);
};

const send = (path, { method, body, auth = true }) =>
  fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth && accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

// Ask the server for a fresh access token using the refresh cookie.
// Resolves to { user, accessToken } or null.
export function refreshSession() {
  refreshing ??= (async () => {
    try {
      const res = await send("/auth/refresh", { method: "POST", auth: false });
      if (!res.ok) return null;
      const data = await res.json();
      accessToken = data.accessToken;
      return data;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function request(path, opts) {
  let res = await send(path, opts);

  if (res.status === 401 && opts.auth !== false) {
    const session = await refreshSession();
    if (!session) {
      accessToken = null;
      authLostListeners.forEach((fn) => fn());
      throw new ApiError(401, "Your session expired. Please log in again.");
    }
    res = await send(path, opts); // retry once with the new token
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message ?? "Something went wrong.", data);
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
