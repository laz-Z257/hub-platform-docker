import { z } from "zod";

const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? process.env.NEXT_PUBLIC_API_URL || "/api"
    : "/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  // Dev fallback: read from cookie (same-origin)
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match?.[1] || null;
}

function requestHeaders(options: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const csrf = getCsrfToken();
  if (csrf && options.method && options.method !== "GET") {
    headers["x-csrf-token"] = csrf;
  }

  return headers;
}

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) return refreshPromise ?? false;
  isRefreshing = true;
  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then(async (r) => {
    if (r.ok) {
      const body = await r.json().catch(() => ({}));
      if (body.csrfToken) setCsrfToken(body.csrfToken);
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
    console.error("Network error:", endpoint, err);
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Verifica que la API esté corriendo.`
    );
  }

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      try {
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (err) {
        console.error("Network error after refresh:", endpoint, err);
        throw new Error("Error de conexión");
      }
    }

    if (!refreshed || res.status === 401) {
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
    console.error("JSON parse error:", endpoint, res.status);
    throw new Error(`Respuesta inesperada del servidor (${res.status})`);
  }

  if (res.status === 403) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "";
    if (msg.includes("bloqueado")) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
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
        console.error(`Validation error for ${endpoint}:`, err.issues);
        throw new Error(`Respuesta inválida del servidor (${endpoint})`);
      }
      throw err;
    }
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, schema?: z.ZodType<T>) =>
    request<T>(endpoint, undefined, schema),
  post: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }, schema),
  patch: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }, schema),
  delete: <T>(endpoint: string, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { method: "DELETE" }, schema),
};
