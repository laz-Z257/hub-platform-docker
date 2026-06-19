"use client";

import { LayoutGrid } from "lucide-react";

interface Module {
  id: number;
  title: string;
  url?: string;
}

const modules: Module[] = [
  { id: 1, title: "Inventario" },
  { id: 2, title: "Facturación" },
  { id: 3, title: "Reportes" },
  { id: 4, title: "Usuarios" },
  { id: 5, title: "Configuración" },
];

export default function ExternalSystemsPage() {
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

      <div className="grid grid-cols-3 gap-6">
        {modules.map((mod) => (
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
        ))}
      </div>
    </div>
  );
}
