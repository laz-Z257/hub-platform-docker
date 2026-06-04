const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match?.[1] || null;
}

function isSecure() {
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  );
}

export function setToken(token: string) {
  document.cookie = `auth-token=${token}; path=/; max-age=86400; samesite=lax${isSecure() ? "; secure" : ""}`;
}

export function clearToken() {
  document.cookie = `auth-token=; path=/; max-age=0; samesite=lax${isSecure() ? "; secure" : ""}`;
}

export function getStoredUser() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  document.cookie = `auth-user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; samesite=lax${isSecure() ? "; secure" : ""}`;
}

export function clearStoredUser() {
  document.cookie = `auth-user=; path=/; max-age=0; samesite=lax${isSecure() ? "; secure" : ""}`;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error("Network error:", endpoint, err);
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Verifica que la API esté corriendo.`
    );
  }

  if (res.status === 401) {
    clearToken();
    clearStoredUser();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada");
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
