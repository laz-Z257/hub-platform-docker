import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { API_URL } from "../services/api";

interface ConnectivityContextType {
  isOnline: boolean;
  lastOnlineAt: Date | null;
  checkNow: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null);

const CHECK_INTERVAL = 60000;
const FAILURES_BEFORE_OFFLINE = 3;

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkNow = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`health status ${res.status}`);
      setIsOnline(true);
      setLastOnlineAt(new Date());
      setConsecutiveFailures(0);
    } catch {
      setConsecutiveFailures((prev) => prev + 1);
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (consecutiveFailures >= FAILURES_BEFORE_OFFLINE) {
      setIsOnline(false);
    }
  }, [consecutiveFailures]);

  useEffect(() => {
    checkNow();
    intervalRef.current = setInterval(checkNow, CHECK_INTERVAL);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkNow();
    });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [checkNow]);

  return (
    <ConnectivityContext.Provider value={{ isOnline, lastOnlineAt, checkNow }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error("useConnectivity must be used within ConnectivityProvider");
  return ctx;
}
