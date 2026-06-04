"use client";

import { Search } from "lucide-react";

interface UserFiltersProps {
  roleFilter: string;
  searchTerm: string;
  onRoleChange: (role: string) => void;
  onSearchChange: (term: string) => void;
}

export default function UserFilters({ roleFilter, searchTerm, onRoleChange, onSearchChange }: UserFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 h-10 px-3.5 border border-gray-300 rounded-lg bg-white">
        <span className="text-xs font-semibold text-gray-500 font-inter">Rol:</span>
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="border-none outline-none bg-transparent text-[13px] font-inter text-gray-800 cursor-pointer font-medium"
        >
          <option value="Todos">Todos</option>
          <option value="admin">Admin</option>
          <option value="user">Usuario</option>
        </select>
      </div>

      <div className="relative w-[340px]">
        <Search
          size={18}
          color="#9CA3AF"
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 border border-gray-200 rounded-[20px] bg-[#EEF2FF] pl-10 pr-4 text-[13px] font-inter text-gray-800 outline-none"
        />
      </div>
    </div>
  );
}
