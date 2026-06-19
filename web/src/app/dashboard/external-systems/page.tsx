"use client";

import { useState } from "react";
import { LayoutGrid, ArrowLeft } from "lucide-react";
import ExternalSystemFrame from "@/components/ExternalSystemFrame";

interface Module {
  id: number;
  title: string;
  url?: string;
}

const modules: Module[] = [
  { id: 1, title: "Traslados", url: "http://192.168.60.66:8100/Seguridad-WEB/XHTML/general/login.xhtml" },
  { id: 2, title: "Inventario" },
  { id: 3, title: "Facturación" },
  { id: 4, title: "Reportes" },
  { id: 5, title: "Usuarios" },
  { id: 6, title: "Configuración" },
];

export default function ExternalSystemsPage() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  if (selectedModule?.url) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#F7F8FC] dark:bg-gray-950 p-8">
        <div className="mb-7 flex items-center gap-4">
          <button
            onClick={() => setSelectedModule(null)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
          >
            <ArrowLeft size={18} color="#6B7280" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-[42px] font-bold text-gray-900 dark:text-white font-inter leading-tight">
              {selectedModule.title}
            </h1>
            <p className="mt-1.5 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
              {selectedModule.url}
            </p>
          </div>
        </div>
        <ExternalSystemFrame src={selectedModule.url} title={selectedModule.title} />
      </div>
    );
  }

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
          <button
            key={mod.id}
            onClick={() => mod.url && setSelectedModule(mod)}
            className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px] cursor-pointer hover:border-[#25207E] dark:hover:border-[#25207E] transition-colors"
            style={{ cursor: mod.url ? "pointer" : "default" }}
          >
            <LayoutGrid size={40} color={mod.url ? "#25207E" : "#9CA3AF"} />
            <span className="text-[#9CA3AF] text-[13px] font-semibold font-inter uppercase tracking-[1px]">
              {mod.title}
            </span>
            {mod.url ? (
              <span className="text-[11px] text-[#25207E] font-inter">Click para abrir</span>
            ) : (
              <span className="text-[11px] text-[#9CA3AF] font-inter">Sin configurar</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
