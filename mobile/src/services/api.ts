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

let authToken: string | null = null;

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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Recover token from storage if lost from memory (live reload / fast refresh)
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

  let data: unknown;

  try {
    data = await res.json();
  } catch {
    console.error("JSON parse error:", endpoint, res.status);
    throw new Error(`Respuesta inesperada del servidor (${res.status})`);
  }

  if (!res.ok) {
    if (res.status === 401) {
      await clearToken();
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
