"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION_MS = 3500;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const styles: Record<ToastType, { icon: ReactNode; bar: string }> = {
    success: {
      icon: <CheckCircle size={18} className="text-green-500 shrink-0" />,
      bar: "border-l-green-500",
    },
    error: {
      icon: <AlertTriangle size={18} className="text-red-500 shrink-0" />,
      bar: "border-l-red-500",
    },
    info: {
      icon: <Info size={18} className="text-blue-500 shrink-0" />,
      bar: "border-l-blue-500",
    },
  };

  return (
    <div
      role="status"
      className={`flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 ${styles[toast.type].bar} rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] pl-4 pr-2 py-3 min-w-[280px] max-w-[380px] animate-[toast-in_0.25s_ease-out]`}
    >
      {styles[toast.type].icon}
      <p className="flex-1 text-[13px] font-medium text-gray-800 dark:text-gray-100 font-inter">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer bg-transparent border-none p-1 shrink-0"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
