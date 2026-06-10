"use client";

import { useState } from "react";
import type { ApiUser } from "@/types/user";
import { api } from "@/lib/api";

interface EditUserModalProps {
  user: ApiUser;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
}

export default function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const [editNombre, setEditNombre] = useState(user.nombre);
  const [editRole, setEditRole] = useState(user.rol);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.patch<ApiUser>(`/users/${user.id}`, {
        nombre: editNombre,
        rol: editRole,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error("Save user:", err instanceof Error ? err.message : err);
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
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter mb-1.5">Editar Usuario</h2>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-inter mb-6">
          {user.documento}
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Nombre</label>
          <input
            type="text"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter text-gray-800 dark:text-gray-100 outline-none"
            placeholder="Nombre del usuario"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Rol</label>
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as "admin" | "user")}
            className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter text-gray-800 dark:text-gray-100 outline-none cursor-pointer"
          >
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="h-10 px-[18px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer text-[13px] font-medium font-inter text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-[18px] rounded-lg border-none font-inter text-[13px] font-semibold text-white"
            style={{
              backgroundColor: saving ? "rgba(37,32,126,0.7)" : "#25207E",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
