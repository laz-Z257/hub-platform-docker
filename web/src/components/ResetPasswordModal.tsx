"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { KeyRound } from "lucide-react";

interface ResetPasswordModalProps {
  userId: string;
  userDocument: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ userId, userDocument, onClose, onSuccess }: ResetPasswordModalProps) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (contrasena.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/users/${userId}/reset-password`, { contrasena });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[100]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-7 w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-gray-900/30"
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          <KeyRound size={20} color="#25207E" strokeWidth={2.5} />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter">
            Restablecer Contraseña
          </h2>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-inter mb-6">
          Usuario: <strong>{userDocument}</strong>
          <br />
          La contraseña debe tener mínimo 6 caracteres. Al guardar, el usuario será desbloqueado automáticamente.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 mb-4 text-[13px] text-red-600 dark:text-red-400 font-inter">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter text-gray-800 dark:text-gray-100 outline-none focus:border-[#25207E]"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter text-gray-800 dark:text-gray-100 outline-none focus:border-[#25207E]"
              placeholder="Repite la contraseña"
              minLength={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-[18px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer text-[13px] font-medium font-inter text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-[18px] rounded-lg border-none font-inter text-[13px] font-semibold text-white"
              style={{
                backgroundColor: saving ? "rgba(37,32,126,0.7)" : "#25207E",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Restablecer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
