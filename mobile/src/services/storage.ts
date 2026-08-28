import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

let memoryToken: string | null = null;
let memoryUser: string | null = null;

async function nativeSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.warn("SecureStore set failed", key, (err as Error).message);
  }
}

async function nativeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.warn("SecureStore get failed", key, (err as Error).message);
    return null;
  }
}

async function nativeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.warn("SecureStore delete failed", key, (err as Error).message);
  }
}

function webSet(key: string, value: string): void {
  if (key === TOKEN_KEY) {
    memoryToken = value;
    return;
  }
  if (key === USER_KEY) {
    memoryUser = value;
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn("localStorage set failed", key, (err as Error).message);
  }
}

function webGet(key: string): string | null {
  if (key === TOKEN_KEY) return memoryToken;
  if (key === USER_KEY) return memoryUser;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn("localStorage get failed", key, (err as Error).message);
    return null;
  }
}

function webDelete(key: string): void {
  if (key === TOKEN_KEY) {
    memoryToken = null;
    return;
  }
  if (key === USER_KEY) {
    memoryUser = null;
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("localStorage remove failed", key, (err as Error).message);
  }
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
const PUSH_TOKEN_KEY = "push_token";

export async function savePushToken(token: string): Promise<void> {
  if (Platform.OS === "web") return;
  await nativeSet(PUSH_TOKEN_KEY, token);
}

export async function getSavedPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  return await nativeGet(PUSH_TOKEN_KEY);
}

export async function deleteSavedPushToken(): Promise<void> {
  if (Platform.OS === "web") return;
  await nativeDelete(PUSH_TOKEN_KEY);
}

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

export async function clearApiCache(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
    }
    return;
  }
  try {
    const secureStore = SecureStore as typeof SecureStore & {
      getAllKeysAsync?: () => Promise<string[]>;
    };
    const allKeys = await secureStore.getAllKeysAsync?.();
    if (allKeys) {
      await Promise.all(
        allKeys
          .filter((key) => key.startsWith(CACHE_PREFIX))
          .map((key) => nativeDelete(key))
      );
    }
  } catch {
  }
}
