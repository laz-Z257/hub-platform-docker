import {
  saveToken,
  getSavedToken,
  deleteToken,
  saveUser,
  getSavedUser,
  deleteUser,
} from "./storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://hub-platform-api.onrender.com/api";

const REQUEST_TIMEOUT = 15000;

let authToken: string | null = null;
let onForceLogout: (() => void) | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function setForceLogoutHandler(handler: () => void) {
  onForceLogout = handler;
}

export async function initToken(): Promise<string | null> {
  try {
    authToken = await getSavedToken();
    return authToken;
  } catch {
    return null;
  }
}

export async function setToken(token: string) {
  authToken = token;
  await saveToken(token);
}

export async function getToken(): Promise<string | null> {
  return authToken;
}

export async function clearToken() {
  authToken = null;
  try {
    await deleteToken();
    await deleteUser();
  } catch (err) {
    console.error("clearToken error:", err);
  }
}

export { saveUser, getSavedUser };

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) return refreshPromise ?? false;
  isRefreshing = true;
  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then(async (r) => {
    if (r.ok) {
      const body = await r.json().catch(() => ({}));
      if (body.token) {
        await setToken(body.token);
      }
    }
    return r.ok;
  });

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!authToken) {
    authToken = await getSavedToken();
  }

  const token = authToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res: Response;

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("La solicitud tardó demasiado. Intenta de nuevo.");
    }
    console.error("Network error:", endpoint, err);
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
  }

  clearTimeout(timeoutId);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = authToken;
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), REQUEST_TIMEOUT);
      try {
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          signal: retryController.signal,
        });
      } catch (err) {
        clearTimeout(retryTimeoutId);
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error("La solicitud tardó demasiado. Intenta de nuevo.");
        }
        console.error("Network error after refresh:", endpoint, err);
        throw new Error("Error de conexión");
      } finally {
        clearTimeout(retryTimeoutId);
      }
    }

    if (!refreshed || res.status === 401) {
      await clearToken();
      onForceLogout?.();
      throw new Error("Sesión expirada");
    }
  }

  let data: unknown;

  try {
    data = await res.json();
  } catch {
    console.error("JSON parse error:", endpoint, res.status);
    throw new Error(`Respuesta inesperada del servidor (${res.status})`);
  }

  if (!res.ok) {
    if (res.status === 403) {
      const msg =
        typeof data === "object" && data !== null && "error" in data
          ? (data as { error: string }).error
          : "";
      if (msg.includes("bloqueado")) {
        await clearToken();
        onForceLogout?.();
        throw new Error("bloqueado");
      }
    }
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "Error en la petición";
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
};
