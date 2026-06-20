"use client";

import { LayoutGrid, ExternalLink } from "lucide-react";

interface Module {
  id: number;
  title: string;
  url?: string;
}

const modules: Module[] = [
  { id: 1, title: "Traslados", url: `${process.env.NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL || "http://192.168.60.66:8100"}/Seguridad-WEB/XHTML/general/login.xhtml` },
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
        {modules.map((mod) =>
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
    </div>
  );
}
