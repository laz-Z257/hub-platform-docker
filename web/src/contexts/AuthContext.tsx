"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  documento: string;
  nombre: string;
  rol: "user" | "admin";
}

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    api.get<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(
    async (documento: string, contrasena: string) => {
      setLoading(true);
      try {
        const data = await api.post<{ user: AuthUser }>(
          "/auth/login",
          { documento, contrasena }
        );
        setUser(data.user);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    router.push("/login");
  }, [router]);

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
