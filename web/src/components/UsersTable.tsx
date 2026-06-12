"use client";

import type { ApiUser } from "@/types/user";

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#25207E", color: "#FFFFFF" },
  asesor: { bg: "#FEF3C7", color: "#D97706" },
  user: { bg: "#DCCFFF", color: "#6D4AFF" },
};

const ESTADO_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  activo: { bg: "#DCFCE7", color: "#16A34A", dot: "#22C55E" },
  bloqueado: { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
};

function getInitials(user: ApiUser): string {
  const name = hasName(user) ? user.nombre : user.documento;
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hasName(user: ApiUser): boolean {
  return user.nombre !== user.documento;
}

function displayName(user: ApiUser): string {
  return hasName(user) ? user.nombre : user.documento;
}

function formatLastActivity(date: string | null): string {
  if (!date) return "Sin actividad";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

interface UsersTableProps {
  users: ApiUser[];
  onEdit: (user: ApiUser) => void;
  onToggleStatus: (user: ApiUser) => void;
  onResetPassword: (user: ApiUser) => void;
}

export default function UsersTable({ users, onEdit, onToggleStatus, onResetPassword }: UsersTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_110px_120px_140px] bg-[#EEF2FF] dark:bg-gray-800 px-5">
        {["USUARIO", "ROL", "ESTADO", "ÚLTIMA ACTIVIDAD", "ACCIONES"].map((col) => (
          <div
            key={col}
            className="py-3.5 px-2 text-[11px] font-semibold text-gray-600 dark:text-gray-400 font-inter uppercase tracking-[0.5px]"
          >
            {col}
          </div>
        ))}
      </div>

      {!Array.isArray(users) ? null : users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#9CA3AF] dark:text-gray-400 font-inter">No se encontraron usuarios</p>
        </div>
      )}
      {Array.isArray(users) && users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[1fr_100px_110px_120px_140px] px-5 border-t border-gray-100 dark:border-gray-700 items-center"
        >
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[#25207E] text-[13px] font-semibold font-inter shrink-0">
              {getInitials(user)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 font-inter">
                {displayName(user)}
              </p>
              {hasName(user) && (
                <p className="text-[11px] text-gray-400 font-inter">
                  {user.documento}
                </p>
              )}
            </div>
          </div>

          <div className="py-3 px-2">
            <span
              className="inline-block px-3 py-[3px] rounded-full text-[11px] font-semibold font-inter"
              style={{ backgroundColor: ROLE_STYLES[user.rol]?.bg ?? "#E5E7EB", color: ROLE_STYLES[user.rol]?.color ?? "#6B7280" }}
            >
              {user.rol.toUpperCase()}
            </span>
          </div>

          <div className="py-3 px-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: ESTADO_STYLES[user.estado]?.dot ?? "#9CA3AF" }}
              />
              <span
                className="inline-block px-2 py-[2px] rounded-full text-[11px] font-medium font-inter"
                style={{ backgroundColor: ESTADO_STYLES[user.estado]?.bg ?? "#F3F4F6", color: ESTADO_STYLES[user.estado]?.color ?? "#6B7280" }}
              >
                {user.estado === "activo" ? "Activo" : "Bloqueado"}
              </span>
            </div>
          </div>

          <div className="py-3 px-2">
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-inter">
              {formatLastActivity(user.ultima_actividad)}
            </span>
          </div>

          <div className="flex items-center gap-2 py-3 px-2 justify-end">
            <button
              onClick={() => onEdit(user)}
              className="h-[30px] px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer text-xs font-medium font-inter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Editar
            </button>
            <button
              onClick={() => onResetPassword(user)}
              className="h-[30px] px-3 rounded-md border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-pointer text-xs font-medium font-inter"
            >
              Reset
            </button>
            <button
              onClick={() => onToggleStatus(user)}
              className={`h-[30px] px-3 rounded-md border cursor-pointer text-xs font-medium font-inter ${
                user.estado === "activo"
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {user.estado === "activo" ? "Bloquear" : "Activar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
