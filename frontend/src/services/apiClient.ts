const API_BASE_URL = "http://localhost:5000/api/v1";

let accessTokenInMemory: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessTokenInMemory(token: string | null): void {
  accessTokenInMemory = token;
}

export function getAccessTokenInMemory(): string | null {
  return accessTokenInMemory;
}

/**
 * Concurrency-safe token refresh execution.
 * Coalesces simultaneous 401 refresh calls into a single HTTP request.
 */
async function performConcurrentSafeRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          const newToken = refreshData.data.accessToken as string;
          setAccessTokenInMemory(newToken);
          return newToken;
        }
      }
      setAccessTokenInMemory(null);
      return null;
    } catch {
      setAccessTokenInMemory(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface FetchOptions extends RequestInit {
  retryOn401?: boolean;
  timeoutMs?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const {
    retryOn401 = true,
    timeoutMs = 10000,
    headers: customHeaders,
    ...restOptions
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (accessTokenInMemory) {
    headers["Authorization"] = `Bearer ${accessTokenInMemory}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      ...restOptions,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized with concurrency-safe automatic token refresh
    if (response.status === 401 && retryOn401 && !endpoint.includes("/auth/refresh")) {
      const newToken = await performConcurrentSafeRefresh();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...restOptions,
          headers,
          credentials: "include",
        });
      }
    }

    const resData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: resData.message || `Request failed with status ${response.status}`,
      };
    }

    return resData;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === "AbortError";
    const errorMessage = isAbort
      ? "Server request timed out. Please check if the backend server is running."
      : "Cannot connect to backend server. Please ensure the server is running on http://localhost:5000.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
