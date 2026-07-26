import { useAuthStore } from "../stores/auth.store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookfry.onrender.com/api/v1";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
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
  };

  config.credentials = "include";

  try {
    const response = await fetch(url, config);

    if (
      response.status === 401 &&
      endpoint !== "/auth/login" &&
      endpoint !== "/auth/register"
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              const newAccessToken = refreshData.data.accessToken;
              const user = refreshData.data.user;
              useAuthStore.getState().setAuth(user, newAccessToken);
              onRefreshed(newAccessToken);
              isRefreshing = false;

              const retryHeaders = {
                ...config.headers,
                Authorization: `Bearer ${newAccessToken}`,
              };
              const retryRes = await fetch(url, {
                ...config,
                headers: retryHeaders,
              });
              const retryData = await retryRes.json();
              if (retryRes.ok && retryData.success) {
                return retryData.data;
              }
              throw new Error(
                retryData.error?.message || "Request failed after refresh",
              );
            }
          }
          useAuthStore.getState().clearAuth();
          isRefreshing = false;
        } catch (refreshErr) {
          useAuthStore.getState().clearAuth();
          isRefreshing = false;
          throw refreshErr;
        }
      } else {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken) => {
            try {
              const retryHeaders = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              };
              const retryRes = await fetch(url, {
                ...config,
                headers: retryHeaders,
              });
              const retryData = await retryRes.json();
              if (retryRes.ok && retryData.success) {
                resolve(retryData.data);
              } else {
                reject(
                  new Error(
                    retryData.error?.message || "Request failed after refresh",
                  ),
                );
              }
            } catch (err) {
              reject(err);
            }
          });
        });
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
  } catch (error) {
    throw error;
  }
}
