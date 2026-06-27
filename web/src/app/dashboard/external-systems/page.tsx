"use client";

import { useState } from "react";
import { LayoutGrid, ExternalLink, Search } from "lucide-react";

interface Module {
  id: number;
  title: string;
  url?: string;
}

const modules: Module[] = [
  { id: 1, title: "Traslados", url: process.env.NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL ? `${process.env.NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL}/Seguridad-WEB/XHTML/general/login.xhtml` : undefined },
  { id: 2, title: "Inventario" },
  { id: 3, title: "Facturación" },
  { id: 4, title: "Reportes" },
  { id: 5, title: "Usuarios" },
  { id: 6, title: "Configuración" },
  { id: 7, title: "Módulo 7" },
  { id: 8, title: "Módulo 8" },
  { id: 9, title: "Módulo 9" },
  { id: 10, title: "Módulo 10" },
  { id: 11, title: "Módulo 11" },
  { id: 12, title: "Módulo 12" },
];

export default function ExternalSystemsPage() {
  const [search, setSearch] = useState("");

  const filtered = modules.filter((mod) =>
    mod.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F7F8FC] dark:bg-gray-950 p-8">
      <div className="mb-7">
        <h1 className="text-[42px] font-bold text-gray-900 dark:text-white font-inter leading-tight">
          Sistemas Externos
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
          Módulos de administración de sistemas externos
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar módulo..."
          className="w-full h-11 pl-10 pr-4 bg-white dark:bg-gray-900 border border-[#D1D5DB] dark:border-gray-600 rounded-lg text-[14px] text-gray-900 dark:text-gray-100 font-inter outline-none focus:border-[var(--brand)] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Search size={48} color="#D1D5DB" strokeWidth={1.5} />
          <p className="mt-4 text-[15px] text-[#9CA3AF] dark:text-gray-500 font-inter">
            No se encontraron módulos con ese nombre
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((mod) =>
            mod.url ? (
            <a
              key={mod.id}
              href={mod.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px] no-underline hover:border-[#25207E] dark:hover:border-[#25207E] transition-colors cursor-pointer"
            >
              <LayoutGrid size={40} color="#25207E" />
              <span className="text-[#25207E] text-[13px] font-semibold font-inter uppercase tracking-[1px]">
                {mod.title}
              </span>
              <span className="text-[11px] text-[#25207E] font-inter flex items-center gap-1">
                <ExternalLink size={12} strokeWidth={2.5} />
                Abrir en nueva pestaña
              </span>
            </a>
          ) : (
            <div
              key={mod.id}
              className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]"
            >
              <LayoutGrid size={40} color="#9CA3AF" />
              <span className="text-[#9CA3AF] text-[13px] font-semibold font-inter uppercase tracking-[1px]">
                {mod.title}
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-inter">Sin configurar</span>
            </div>
          )
        )}
      </div>
      )}
    </div>
  );
}
