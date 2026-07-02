import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

async function nativeSet(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function nativeGet(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

async function nativeDelete(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

function webSet(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function webGet(key: string): string | null {
  return localStorage.getItem(key);
}

function webDelete(key: string): void {
  localStorage.removeItem(key);
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(TOKEN_KEY, token);
  } else {
    await nativeSet(TOKEN_KEY, token);
  }
}

export async function getSavedToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return webGet(TOKEN_KEY);
  }
  return await nativeGet(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === "web") {
    webDelete(TOKEN_KEY);
  } else {
    await nativeDelete(TOKEN_KEY);
  }
}

export async function saveUser(user: unknown): Promise<void> {
  const value = JSON.stringify(user);
  if (Platform.OS === "web") {
    webSet(USER_KEY, value);
  } else {
    await nativeSet(USER_KEY, value);
  }
}

export async function getSavedUser(): Promise<unknown | null> {
  let raw: string | null;
  if (Platform.OS === "web") {
    raw = webGet(USER_KEY);
  } else {
    raw = await nativeGet(USER_KEY);
  }

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteUser(): Promise<void> {
  if (Platform.OS === "web") {
    webDelete(USER_KEY);
  } else {
    await nativeDelete(USER_KEY);
  }
}

const CACHE_PREFIX = "api_cache_";

export async function saveCache(key: string, data: unknown): Promise<void> {
  const value = JSON.stringify({ data, ts: Date.now() });
  if (Platform.OS === "web") {
    webSet(CACHE_PREFIX + key, value);
  } else {
    await nativeSet(CACHE_PREFIX + key, value);
  }
}

export async function getCache<T>(key: string, maxAgeMs = 60000): Promise<T | null> {
  let raw: string | null;
  if (Platform.OS === "web") {
    raw = webGet(CACHE_PREFIX + key);
  } else {
    raw = await nativeGet(CACHE_PREFIX + key);
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > maxAgeMs) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}
