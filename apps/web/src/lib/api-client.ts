import { useAuthStore } from "../stores/auth.store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookfry.onrender.com/api/v1";

// Global single-flight refresh promise
let refreshPromise: Promise<string | null> | null = null;

/**
 * Executes a single-flight token refresh. If multiple API requests fail with 401
 * simultaneously, they all share and await this exact same promise, ensuring only
 * one `/auth/refresh` HTTP call is made.
 */
async function executeTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!refreshRes.ok) {
        useAuthStore.getState().clearAuth();
        return null;
      }

      const refreshData = await refreshRes.json();
      if (refreshData.success && refreshData.data?.accessToken) {
        const newAccessToken = refreshData.data.accessToken;
        const user = refreshData.data.user;
        useAuthStore.getState().setAuth(user, newAccessToken);
        return newAccessToken;
      }

      useAuthStore.getState().clearAuth();
      return null;
    } catch (err) {
      console.error("[apiClient] Token refresh failed:", err);
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = useAuthStore.getState().accessToken;

  const defaultHeaders: Record<string, string> = {};

  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: customConfig.body ? "POST" : "GET",
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
    credentials: "include",
  };

  const response = await fetch(url, config);

  // Check for 401 on non-auth endpoints and attempt single-flight refresh
  const isAuthEndpoint =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint === "/auth/refresh";

  if (response.status === 401 && !isAuthEndpoint) {
    const newToken = await executeTokenRefresh();
    if (newToken) {
      // Retry original request exactly once with new token
      const retryHeaders = {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(url, {
        ...config,
        headers: retryHeaders,
      });

      const retryData = await retryRes.json();
      if (!retryRes.ok || !retryData.success) {
        const errMsg = retryData.error?.message || "Request failed after refresh";
        const errCode = retryData.error?.code || "API_ERROR";
        const error = new Error(errMsg) as Error & {
          code?: string;
          details?: unknown[];
          status?: number;
        };
        error.code = errCode;
        error.details = retryData.error?.details;
        error.status = retryRes.status;
        throw error;
      }

      return retryData.data;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.error?.message || "Something went wrong";
    const errCode = data.error?.code || "API_ERROR";
    const error = new Error(errMsg) as Error & {
      code?: string;
      details?: unknown[];
      status?: number;
    };
    error.code = errCode;
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }

  return data.data;
}
