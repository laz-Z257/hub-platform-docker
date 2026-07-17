import { z } from "zod";
import { logger } from "./logger";

const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? process.env.NEXT_PUBLIC_API_URL || "/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match?.[1] || null;
}

function requestHeaders(options: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const csrf = getCsrfToken();
  if (csrf && options.method && options.method !== "GET") {
    headers["x-csrf-token"] = csrf;
  }

  return headers;
}

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) return refreshPromise ?? false;
  isRefreshing = true;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers,
    credentials: "include",
  }).then(async (r) => {
    if (r.ok) {
      const body = await r.json().catch(() => ({}));
      if (body.csrfToken) setCsrfToken(body.csrfToken);
      if (body.token) setAuthToken(body.token);
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
  schema?: z.ZodType<T>
): Promise<T> {
  const headers = requestHeaders(options);

  let res: Response;

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (err) {
    logger.error("Network error", { endpoint, error: (err as Error).message });
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Verifica que la API esté corriendo.`
    );
  }

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryHeaders = requestHeaders(options);
      try {
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        });
      } catch (err) {
        logger.error("Network error after refresh", { endpoint, error: (err as Error).message });
        throw new Error("Error de conexión");
      }
    }

    if (!refreshed || res.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
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

  if (res.status === 403) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "";
    if (msg.includes("bloqueado")) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        alert("Su cuenta ha sido bloqueada. Contacte al administrador.");
        window.location.href = "/login";
      }
      throw new Error("Usuario bloqueado");
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "Error en la petición";
    throw new Error(msg);
  }

  if (schema) {
    try {
      return schema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error("Validation error", { endpoint, issues: err.issues });
        throw new Error(`Respuesta inválida del servidor (${endpoint})`);
      }
      throw err;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    logger.warn(`Respuesta sin schema de validación para ${endpoint}`);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, schema?: z.ZodType<T>) =>
    request<T>(endpoint, undefined, schema),
  post: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }, schema),
  put: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }, schema),
  patch: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }, schema),
  delete: <T>(endpoint: string, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "DELETE" }, schema),
};
