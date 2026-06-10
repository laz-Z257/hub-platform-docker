import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  api,
  setToken,
  clearToken,
  initToken,
  saveUser,
  getSavedUser,
} from "../services/api";
import type { AuthUser } from "../../../shared/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  login: (documento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
        }
      } catch {
        // token invalid or expired
        await clearToken();
      } finally {
        setInitializing(false);
      }
    }

    restore();
  }, []);

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
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
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
