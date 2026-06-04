"use client";

import type { ApiUser } from "@/types/user";

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#25207E", color: "#FFFFFF" },
  user: { bg: "#DCCFFF", color: "#6D4AFF" },
};

function getInitials(user: ApiUser): string {
  const name = hasName(user) ? user.nombre : user.documento;
  return name
    .split(" ")
    .map((n) => n[0])
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

interface UsersTableProps {
  users: ApiUser[];
  onEdit: (user: ApiUser) => void;
}

export default function UsersTable({ users, onEdit }: UsersTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_120px] bg-[#EEF2FF] px-5">
        {["USUARIO", "ROL", "ESTADO", "ÚLTIMA ACTIVIDAD", "ACCIONES"].map((col) => (
          <div
            key={col}
            className="py-3.5 px-2 text-[11px] font-semibold text-gray-600 font-inter uppercase tracking-[0.5px]"
          >
            {col}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#9CA3AF] font-inter">No se encontraron usuarios</p>
        </div>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[1fr_1fr_1fr_1fr_120px] px-5 border-t border-gray-100 items-center"
        >
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[#25207E] text-[13px] font-semibold font-inter shrink-0">
              {getInitials(user)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 font-inter">
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

          <div className="flex items-center gap-2 py-3 px-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[13px] text-gray-700 font-inter">Activo</span>
          </div>

          <div className="py-3 px-2">
            <span className="text-[13px] text-gray-500 font-inter">
              {new Date(user.created_at).toLocaleDateString("es-CO")}
            </span>
          </div>

          <div className="flex items-center gap-2 py-3 px-2 justify-end">
            <button
              onClick={() => onEdit(user)}
              className="h-[30px] px-3 rounded-md border border-gray-200 bg-white cursor-pointer text-xs font-medium font-inter text-gray-700"
            >
              Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
