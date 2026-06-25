"use client";

import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function UserFilters({ searchTerm, onSearchChange }: UserFiltersProps) {
  return (
    <div className="flex items-center gap-3">
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
          className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-[20px] bg-[#EEF2FF] dark:bg-gray-800 pl-10 pr-4 text-[13px] font-inter text-gray-800 dark:text-gray-100 outline-none"
        />
      </div>
    </div>
  );
}
