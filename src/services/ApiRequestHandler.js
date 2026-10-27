import { branchStorage } from "./branchStorage";
import { tokenStorage } from "./tokenStorage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// AuthProvider registers this so the UI logs out when the session can't be refreshed
let onSessionExpired = () => {};
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

const parseResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = json?.error?.details;
    // Show the first field error for validation failures, otherwise the general message
    const message = (details && Object.values(details)[0]) || json?.message || "Something went wrong. Please try again.";
    throw new ApiError(message, res.status, details);
  }
  return json;
};

// Only one refresh runs at a time; parallel 401s wait for the same promise
let refreshPromise = null;

const refreshTokens = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) throw new ApiError("Session expired. Please log in again.", 401);

      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await parseResponse(res);
      tokenStorage.setTokens(json.data);
    })()
      .catch((err) => {
        tokenStorage.clear();
        onSessionExpired();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const send = (path, { method, body, auth }) => {
  const headers = { "Content-Type": "application/json" };
  const accessToken = tokenStorage.getAccessToken();
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  // Branch-level APIs use this for main admins; the server ignores it for branch staff
  const branchId = branchStorage.getId();
  if (auth && branchId) headers["X-Branch-Id"] = branchId;

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

// Returns the backend's { success, message, data } body, or throws ApiError.
// Requests with auth: true refresh the access token once on 401 and retry.
export const apiRequest = async (path, { method = "GET", body, auth = true } = {}) => {
  let res;
  try {
    res = await send(path, { method, body, auth });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection.", 0);
  }

  if (res.status === 401 && auth && tokenStorage.hasTokens()) {
    await refreshTokens();
    res = await send(path, { method, body, auth });
  }

  return parseResponse(res);
};
