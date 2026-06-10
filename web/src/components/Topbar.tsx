"use client";

import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search, UserPlus } from "lucide-react";

export default function Topbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const isAnalytics = pathname === "/dashboard/analytics";
  const isUsers = pathname === "/dashboard/users";
  const isTickets = pathname === "/dashboard/tickets";

  const placeholder = isUsers
    ? "Buscar usuarios por nombre o email..."
    : isAnalytics
      ? "Buscar reportes o métricas..."
      : isTickets
        ? "Buscar tickets, usuarios o ID..."
        : "Buscar en el sistema...";

  return (
    <header className="fixed top-0 left-[250px] right-0 h-[72px] bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 flex items-center px-6 z-30">
      <div className="relative w-80">
        <Search
          size={18}
          color="#9CA3AF"
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-[42px] border border-gray-200 dark:border-gray-700 rounded-[20px] bg-[#EEF2FF] dark:bg-gray-800 pl-10 pr-4 text-[13px] font-inter text-gray-800 dark:text-gray-100 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <button className="bg-none border-none cursor-pointer relative p-2 rounded-lg">
          <Bell size={20} color="#6B7280" strokeWidth={2} />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <button className="bg-none border-none cursor-pointer p-2 rounded-lg">
          <HelpCircle size={20} color="#6B7280" strokeWidth={2} />
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <span className="text-[13px] font-semibold text-[#25207E] font-inter">
          User - {userName || "xxxxxx"}
        </span>

        {isUsers && (
          <button className="flex items-center gap-2 h-10 px-4 bg-[#25207E] border-none rounded-lg cursor-pointer text-[13px] font-semibold font-inter text-white">
            <UserPlus size={16} strokeWidth={2.5} />
            Añadir Usuario
          </button>
        )}
      </div>
    </header>
  );
}
