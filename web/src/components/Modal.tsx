"use client";

import { useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  showCancel = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    error: <AlertTriangle className="w-6 h-6 text-red-500" />,
  };

  const bgColors = {
    info: "bg-blue-50",
    success: "bg-green-50",
    warning: "bg-yellow-50",
    error: "bg-red-50",
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-start gap-4 p-6">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColors[type]} flex items-center justify-center`}>
            {icons[type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#25207E] hover:bg-[#1a165e] rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
