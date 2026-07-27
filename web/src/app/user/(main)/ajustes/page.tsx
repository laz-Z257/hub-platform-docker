"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, LogOut, Database } from "lucide-react";

export default function AjustesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ items: 0, size: "0 KB" });

  useEffect(() => {
    estimateCache();
  }, []);

  function estimateCache() {
    let items = 0;
    let bytes = 0;
    if (typeof localStorage !== "undefined") {
      items = localStorage.length || 0;
      for (let i = 0; i < items; i++) {
        const key = localStorage.key(i);
        if (key) {
          bytes += key.length * 2;
          bytes += (localStorage.getItem(key)?.length || 0) * 2;
        }
      }
    }
    const size = bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
    setCacheInfo({ items, size });
  }

  async function handleClearCache() {
    if (!window.confirm("¿Estás seguro de querer eliminar el caché? Se cerrará tu sesión.")) return;
    setClearing(true);
    try {
      await logout();
      if (typeof localStorage !== "undefined") localStorage.clear();
      window.location.href = "/user/login";
    } catch {
      setClearing(false);
    }
  }

  async function handleLogout() {
    if (!window.confirm("¿Estás seguro de cerrar sesión?")) return;
    try {
      await logout();
    } catch {}
    router.replace("/user/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="bg-white border-b border-gray-200">
        <div className="h-[72px] flex items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEEDF8] flex items-center justify-center">
              <span className="text-[#25207E] text-xs font-bold">H</span>
            </div>
            <span className="text-[22px] font-bold text-[#25207E]">CorpSupport</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#DCD4FF] flex items-center justify-center">
            <span className="text-[#25207E] text-sm font-bold">
              {user?.nombre?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-8 space-y-4">
        <div className="bg-white border border-[#D9DCE8] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 size={18} color="#DC2626" strokeWidth={2} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1F2937]">Limpiar Caché</h2>
          </div>
          <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
            Elimina los datos almacenados localmente (tokens, sesión, archivos temporales). La app se recargará automáticamente.
          </p>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-[#F9FAFB] rounded-lg p-2.5 text-center">
              <Database size={16} color="#6B7280" className="mx-auto" strokeWidth={2} />
              <p className="text-base font-bold text-[#1F2937] mt-1">{cacheInfo.items}</p>
              <p className="text-[11px] text-[#9CA3AF]">ítems</p>
            </div>
            <div className="flex-1 bg-[#F3F0FF] rounded-lg p-2.5 text-center">
              <Trash2 size={16} color="#25207E" className="mx-auto" strokeWidth={2} />
              <p className="text-base font-bold text-[#25207E] mt-1">{cacheInfo.size}</p>
              <p className="text-[11px] text-[#9CA3AF]">tamaño</p>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="w-full h-11 rounded-lg bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-red-300 hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} strokeWidth={2} />
            {clearing ? "Limpiando..." : "Limpiar Caché"}
          </button>
        </div>

        <div className="bg-white border border-[#D9DCE8] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <LogOut size={18} color="#D97706" strokeWidth={2} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1F2937]">Cerrar Sesión</h2>
          </div>
          <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
            {user?.nombre ? `Sesión iniciada como ${user.nombre}` : "Sesión iniciada"}
          </p>
          <button
            onClick={handleLogout}
            className="w-full h-11 rounded-lg bg-amber-100 text-amber-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"
          >
            <LogOut size={16} strokeWidth={2} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
