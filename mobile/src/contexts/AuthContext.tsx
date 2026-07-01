import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  api,
  setToken,
  clearToken,
  initToken,
  saveUser,
  getSavedUser,
  setForceLogoutHandler,
  setBlockedHandler,
} from "../services/api";
import { registerForPushNotifications, setupNotificationListeners } from "../services/notifications";
import type { AuthUser } from "@hub/shared/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  login: (documento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Restore session on app start
  useEffect(() => {
    async function restore() {
      try {
        const token = await initToken();
        if (token) {
          const savedUser = await getSavedUser();
          if (savedUser) {
            setUser(savedUser as AuthUser);
          }
          try {
            const fresh = await api.get<AuthUser>("/auth/me");
            setUser(fresh);
            await saveUser(fresh);
            registerForPushNotifications().catch(() => {});
            router.replace("/chat");
          } catch (err) {
            await clearToken();
            setUser(null);
            if (err instanceof Error && err.message === "bloqueado") {
              const originalMsg = (err as { originalMsg?: string }).originalMsg;
              Alert.alert(
                "Cuenta bloqueada",
                originalMsg || "Su cuenta ha sido bloqueada. Contacte al administrador."
              );
              router.replace("/");
            }
          }
        }
      } catch {
        await clearToken();
      } finally {
        setInitializing(false);
      }
    }

    restore();
  }, [router]);

  useEffect(() => {
    return setupNotificationListeners((data) => {
      if (data.incidentId) {
        router.push(`/incidente/${data.incidentId}`);
      }
    });
  }, [router]);

  useEffect(() => {
    setForceLogoutHandler(() => {
      setUser(null);
      router.replace("/");
    });

    setBlockedHandler(() => {
      Alert.alert(
        "Cuenta bloqueada",
        "Su cuenta ha sido bloqueada. Contacte al administrador para mas informacion."
      );
    });
  }, [router]);

  const login = useCallback(
    async (documento: string, contrasena: string) => {
      setLoading(true);
      try {
        const data = await api.post<{ token: string; user: AuthUser }>(
          "/auth/login",
          { documento, contrasena }
        );

        await setToken(data.token);
        await saveUser(data.user);
        setUser(data.user);

        registerForPushNotifications().catch(() => {});
      } catch (err) {
        if (err instanceof Error && err.message === "bloqueado") {
          const originalMsg = (err as { originalMsg?: string }).originalMsg;
          throw new Error(originalMsg || "Usuario bloqueado");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
