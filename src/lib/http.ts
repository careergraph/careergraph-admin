import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/authStore";

const authExemptEndpoints = ["/auth/login", "/auth/refresh"];

const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getAccessTokenFromResponse = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const response = data as Record<string, unknown>;

  if (typeof response.accessToken === "string") {
    return response.accessToken;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    typeof (response.data as Record<string, unknown>).accessToken === "string"
  ) {
    return (response.data as Record<string, unknown>).accessToken as string;
  }

  return null;
};

const attachAuthorizationHeader = (
  headers: InternalAxiosRequestConfig["headers"],
  token: string
): AxiosRequestHeaders => {
  if (headers instanceof AxiosHeaders) {
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }

  if (headers && typeof headers === "object" && !Array.isArray(headers)) {
    return new AxiosHeaders({
      ...(headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    });
  }

  return new AxiosHeaders({
    Authorization: `Bearer ${token}`,
  });
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await refreshClient.post("/auth/refresh");
    return getAccessTokenFromResponse(response.data);
  } catch {
    return null;
  }
};

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const addPendingRequest = (callback: (token: string | null) => void) => {
  pendingRequests.push(callback);
};

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    const requestUrl = config.url ?? "";
    const isAuthRequest = authExemptEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (token && !isAuthRequest) {
      config.headers = attachAuthorizationHeader(config.headers, token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;
    const status = error.response?.status;

    if (!originalRequest || !status) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";
    const isAuthRequest = authExemptEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (status === 401 && !isAuthRequest) {
      if (originalRequest._retry) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addPendingRequest((token) => {
            if (!token) {
              reject(error);
              return;
            }

            originalRequest.headers = attachAuthorizationHeader(
              originalRequest.headers,
              token
            );
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (!newToken) {
          resolvePendingRequests(null);
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        useAuthStore.getState().setAccessToken(newToken);
        resolvePendingRequests(newToken);
        originalRequest.headers = attachAuthorizationHeader(
          originalRequest.headers,
          newToken
        );
        return api(originalRequest);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && !isAuthRequest) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;
