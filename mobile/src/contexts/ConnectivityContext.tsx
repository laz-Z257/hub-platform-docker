import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { api } from "../services/api";

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
    try {
      await api.get("/health", 5000);
      setIsOnline(true);
      setLastOnlineAt(new Date());
      setConsecutiveFailures(0);
    } catch {
      setConsecutiveFailures((prev) => {
        const newCount = prev + 1;
        if (newCount >= FAILURES_BEFORE_OFFLINE) {
          setIsOnline(false);
        }
        return newCount;
      });
    }
  }, []);

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
