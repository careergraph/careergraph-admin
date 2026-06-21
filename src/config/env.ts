const DEFAULT_API_CONTEXT_PATH = "/careergraph/api/v1";

const normalizeApiBaseUrl = (rawBaseUrl: string): string => {
  let normalized = rawBaseUrl.trim();

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    normalized.startsWith("http://")
  ) {
    normalized = `https://${normalized.slice("http://".length)}`;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.pathname === "" || parsed.pathname === "/") {
      parsed.pathname = DEFAULT_API_CONTEXT_PATH;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return normalized.replace(/\/$/, "");
  }
};

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? "CareerGraph Admin",
  apiBaseUrl: normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/careergraph/api/v1"
  ),
  rtcBaseUrl: import.meta.env.VITE_RTC_BASE_URL ?? "http://localhost:3000",
} as const;
