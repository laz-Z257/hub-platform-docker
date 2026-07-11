import {
  saveToken,
  getSavedToken,
  deleteToken,
  saveUser,
  getSavedUser,
  deleteUser,
  saveCache,
  getCache,
} from "./storage";
import { logger } from "./logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL environment variable is required");
}

const REQUEST_TIMEOUT = 15000;

let authToken: string | null = null;
let onForceLogout: (() => void) | null = null;
let onBlocked: (() => void) | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function setForceLogoutHandler(handler: () => void) {
  onForceLogout = handler;
}

export function setBlockedHandler(handler: () => void) {
  onBlocked = handler;
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

export async function clearToken() {
  authToken = null;
  try {
    await deleteToken();
    await deleteUser();
  } catch (err) {
    logger.error("clearToken error", { error: (err as Error).message });
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
  options: RequestInit = {},
  timeoutMs?: number
): Promise<T> {
  if (!authToken) {
    authToken = await getSavedToken();
  }

  const token = authToken;
  const isGet = !options.method || options.method === "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? REQUEST_TIMEOUT);

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
    logger.error("Network error", { endpoint, error: (err as Error).message });
    if (isGet) {
      const cached = await getCache<T>(endpoint);
      if (cached) return cached;
    }
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
  }

  clearTimeout(timeoutId);

  if (res.status === 401) {
    if (!authToken) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error || "Documento o contraseña incorrectos";
      throw new Error(msg);
    }

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
        logger.error("Network error after refresh", { endpoint, error: (err as Error).message });
        if (isGet) {
          const cached = await getCache<T>(endpoint);
          if (cached) return cached;
        }
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
    logger.error("JSON parse error", { endpoint, status: res.status });
    throw new Error(`Respuesta inesperada del servidor (${res.status})`);
  }

  if (!res.ok) {
    if (res.status === 403) {
      const msg =
        typeof data === "object" && data !== null && "error" in data
          ? (data as { error: string }).error
          : "";
      if (msg.includes("bloqueado")) {
        const hadToken = !!authToken;
        await clearToken();
        if (hadToken) {
          onBlocked?.();
          onForceLogout?.();
        }
        const err = new Error("bloqueado");
        (err as { originalMsg?: string }).originalMsg = msg;
        throw err;
      }
    }
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "Error en la petición";
    throw new Error(msg);
  }

  if (isGet) {
    saveCache(endpoint, data);
  }

  if (data === null || data === undefined) {
    throw new Error(`Respuesta inválida: ${endpoint} retornó ${data === null ? "null" : "undefined"}`);
  }
  if (typeof data !== "object") {
    throw new Error(`Respuesta inválida: ${endpoint} retornó un tipo inesperado (${typeof data})`);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, timeoutMs?: number) => request<T>(endpoint, undefined, timeoutMs),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
};
