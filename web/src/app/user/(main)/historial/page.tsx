"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate, ESTADO_LABELS, ESTADO_COLORS } from "@/lib/utils";
import { URGENCIA_COLORS } from "@/lib/styles";
import { MessageSquare, History, AlertCircle, RefreshCw } from "lucide-react";

interface Incident {
  id: string; nombre: string; punto_venta: string;
  descripcion: string; urgencia: "baja" | "media" | "alta";
  estado: "pendiente" | "en_proceso" | "resuelto"; created_at: string;
}


export default function HistorialPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(() => {
    setError(null);
    api.get<{ items: Incident[] }>("/incidents?limit=50")
      .then((data) => setIncidents(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar el historial"))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleRefresh = () => { setRefreshing(true); fetchIncidents(); };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-white border-b border-gray-200 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1F2366]">Historial</h1>
          <button onClick={() => router.push("/user/chat")}>
            <MessageSquare size={22} color="#1F2366" strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mt-1">Tus incidentes reportados</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-[3px] border-gray-200 border-t-[#3B348B] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-[#3B348B] font-medium mb-2"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>

          {incidents.length === 0 ? (
            <div className="flex flex-col items-center pt-16">
              {error ? (
                <>
                  <AlertCircle size={40} color="#EF4444" strokeWidth={1.5} />
                  <p className="mt-3 text-[15px] text-[#EF4444] text-center px-5">{error}</p>
                </>
              ) : (
                <>
                  <History size={40} color="#D1D5DB" strokeWidth={1.5} />
                  <p className="mt-3 text-[15px] text-[#9CA3AF]">No tienes incidentes reportados</p>
                </>
              )}
            </div>
          ) : (
            incidents.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/user/incidente/${item.id}`)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-[#DCD4FF] transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-[#1F2937] truncate flex-1">{item.punto_venta}</h3>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-2"
                    style={{ backgroundColor: URGENCIA_COLORS[item.urgencia] + "20", color: URGENCIA_COLORS[item.urgencia] }}
                  >
                    {item.urgencia.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] line-clamp-2 mb-2.5">{item.descripcion}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ESTADO_COLORS[item.estado] }} />
                    <span className="text-[13px] text-[#374151]">{ESTADO_LABELS[item.estado]}</span>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">
                    {new Date(item.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
