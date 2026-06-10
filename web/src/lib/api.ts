const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) return refreshPromise ?? false;
  isRefreshing = true;
  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then((r) => r.ok);

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

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
      if (typeof window !== "undefined") {
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

  if (!res.ok) {
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
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
