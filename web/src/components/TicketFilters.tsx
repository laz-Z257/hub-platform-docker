"use client";

import { Search, Download, ChevronDown } from "lucide-react";

interface TicketFiltersProps {
  searchTerm: string;
  estadoFilter: string;
  prioridadFilter: string;
  dateFilter: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onPrioridadChange: (v: string) => void;
  onDateChange: (v: string) => void;
}

const selectClass =
  "h-9 px-3 border border-[#E5E7EB] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[13px] font-inter text-[#1F2937] dark:text-gray-100 outline-none cursor-pointer appearance-none pr-8";

export default function TicketFilters({
  searchTerm,
  estadoFilter,
  prioridadFilter,
  dateFilter,
  onSearchChange,
  onEstadoChange,
  onPrioridadChange,
  onDateChange,
}: TicketFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-[10px] h-[60px] flex items-center px-4 gap-3 mb-5">
      <div className="relative flex-1 max-w-[340px]">
        <Search
          size={16}
          color="#9CA3AF"
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filtrar por asunto o ID..."
          className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[13px] font-inter text-[#1F2937] dark:text-gray-100 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-gray-400"
        />
      </div>

      <div className="relative">
        <select
          value={estadoFilter}
          onChange={(e) => onEstadoChange(e.target.value)}
          className={selectClass}
        >
          <option value="Todos">Estado: Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <ChevronDown
          size={14}
          color="#9CA3AF"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      <div className="relative">
        <select
          value={prioridadFilter}
          onChange={(e) => onPrioridadChange(e.target.value)}
          className={selectClass}
        >
          <option value="Todas">Prioridad: Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <ChevronDown
          size={14}
          color="#9CA3AF"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      <div className="relative">
        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className={selectClass}
        >
          <option value="30d">Últimos 30 días</option>
          <option value="7d">Últimos 7 días</option>
          <option value="today">Hoy</option>
          <option value="all">Todos</option>
        </select>
        <ChevronDown
          size={14}
          color="#9CA3AF"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      <button className="w-9 h-9 flex items-center justify-center border border-[#E5E7EB] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 cursor-pointer">
        <Download size={16} color="#6B7280" strokeWidth={2} />
      </button>
    </div>
  );
}
