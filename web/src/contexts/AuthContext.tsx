"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, setCsrfToken, setAuthToken, clearAuthToken, setAuthScope } from "@/lib/api";
import type { AuthUser } from "@hub/shared/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  login: (documento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const scope = pathname.startsWith("/user") ? "user" : "admin";
    setAuthScope(scope);
    api.get<AuthUser & { csrfToken?: string }>("/auth/me")
      .then((data) => {
        setUser(data);
        if (data.csrfToken) setCsrfToken(data.csrfToken);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(
    async (documento: string, contrasena: string) => {
      setLoading(true);
      try {
        const scope = pathname.startsWith("/user") ? "user" : "admin";
        setAuthScope(scope);
        const data = await api.post<{ user: AuthUser; csrfToken?: string; token: string }>(
          "/auth/login",
          { documento, contrasena, scope }
        );
        setUser(data.user);
        setAuthToken(data.token);
        if (data.csrfToken) setCsrfToken(data.csrfToken);
        router.push(scope === "admin" ? "/dashboard" : "/user/chat");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    clearAuthToken();
    setAuthScope(null);
    setUser(null);
    router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
