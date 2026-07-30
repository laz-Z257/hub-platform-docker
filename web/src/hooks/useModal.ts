"use client";

import { useState, useCallback } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function useModal() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = useCallback(
    (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
        showCancel: false,
      });
    },
    []
  );

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void, confirmText = "Aceptar", cancelText = "Cancelar") => {
      setModal({
        isOpen: true,
        title,
        message,
        type: "warning",
        onConfirm,
        confirmText,
        cancelText,
        showCancel: true,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modal,
    showAlert,
    showConfirm,
    closeModal,
  };
}
