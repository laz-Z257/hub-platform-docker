"use client";

import { useState, useCallback, useEffect } from "react";
import { ClipboardList, CheckCircle, Clock, Activity, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  TrafficChart,
  DonutChart,
  StatusBarChart,
  type AreaDataPoint,
  type DonutDataPoint,
  type StatusBarDataPoint,
} from "@/components/AnalyticsCharts";
import AnalyticsMetrics from "@/components/AnalyticsMetrics";
import AnalyticsFilters from "@/components/AnalyticsFilters";
import { api } from "@/lib/api";

interface KpiResponse {
  totalIncidentes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
  usuariosActivos: number;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function getDefaultRange(): { start: string; end: string } {
  const today = new Date();
  const thirtyAgo = new Date(today);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  return {
    start: thirtyAgo.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  };
}


export default function AnalyticsPage() {
  const [filter, setFilter] = useState<"30d" | "custom">("30d");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedRange, setAppliedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [metrics, setMetrics] = useState<{ icon: LucideIcon; title: string; value: string; desc: string }[]>([]);
  const [areaData, setAreaData] = useState<AreaDataPoint[]>([]);
  const [donutData, setDonutData] = useState<DonutDataPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusBarDataPoint[]>([]);
  const [agentes, setAgentes] = useState<string[]>([]);
  const [selectedAgente, setSelectedAgente] = useState("");

  useEffect(() => {
    api.get<string[]>("/incidents/agentes")
      .then(setAgentes)
      .catch(() => {});
  }, []);

  function fetchData(start: string, end: string, agente?: string) {
    const params = new URLSearchParams({ start, end });
    if (agente) params.set("agente", agente);
    const qs = `?${params.toString()}`;

    api
      .get<KpiResponse>(`/dashboard/kpis${qs}`)
      .then((kpis) => {
        setMetrics([
          { icon: ClipboardList, title: "Incidentes Reportados", value: kpis.totalIncidentes.toLocaleString(), desc: "Total de incidentes registrados" },
          { icon: Clock, title: "Pendientes", value: kpis.pendientes.toLocaleString(), desc: "A la espera de asignación" },
          { icon: Activity, title: "En Proceso", value: kpis.enProceso.toLocaleString(), desc: "Siendo atendidos actualmente" },
          { icon: CheckCircle, title: "Resueltos", value: kpis.resueltos.toLocaleString(), desc: "Cerrados exitosamente" },
        ]);
      })
      .catch((err) => {
        console.error("Analytics KPIs:", err instanceof Error ? err.message : err);
      });

    api
      .get<{ timeline: { fecha: string; incidentes: number; resueltos: number }[]; distribution: DonutDataPoint[]; statusCounts: { pendientes: number; enProceso: number; resueltos: number } }>(`/incidents/stats${qs}`)
      .then((stats) => {
        setAreaData(
          (Array.isArray(stats.timeline) ? stats.timeline : []).map((d) => ({
            name: d.fecha,
            trafico: d.incidentes,
            conversiones: d.resueltos,
          }))
        );
        setDonutData(stats.distribution);
        if (stats.statusCounts) {
          setStatusData([{
            name: selectedAgente || "General",
            pendientes: stats.statusCounts.pendientes,
            enProceso: stats.statusCounts.enProceso,
            resueltos: stats.statusCounts.resueltos,
          }]);
        }
      })
      .catch((err) => {
        console.error("Analytics stats:", err instanceof Error ? err.message : err);
      });
  }

  useEffect(() => {
    const range = getDefaultRange();
    fetchData(range.start, range.end);
  }, []);

  const handleFilterChange = (newFilter: "30d" | "custom") => {
    if (newFilter === "30d") {
      setFilter("30d");
      setShowDatePicker(false);
      setAppliedRange(null);
      const range = getDefaultRange();
      fetchData(range.start, range.end, selectedAgente);
    } else {
      setFilter("custom");
      setShowDatePicker(true);
      if (!startDate) {
        const today = new Date();
        const thirtyAgo = new Date(today);
        thirtyAgo.setDate(thirtyAgo.getDate() - 30);
        setStartDate(thirtyAgo.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
      }
    }
  };

  const handleAgentChange = (agente: string) => {
    setSelectedAgente(agente);
    const range = appliedRange || getDefaultRange();
    fetchData(range.start, range.end, agente || undefined);
  };

  const handleApplyRange = useCallback(() => {
    if (startDate && endDate && startDate <= endDate) {
      setAppliedRange({ start: startDate, end: endDate });
      setShowDatePicker(false);
      fetchData(startDate, endDate, selectedAgente);
    }
  }, [startDate, endDate, selectedAgente]);

  const handleCancelRange = useCallback(() => {
    setShowDatePicker(false);
    setFilter("30d");
    setAppliedRange(null);
    const range = getDefaultRange();
    fetchData(range.start, range.end, selectedAgente);
  }, [selectedAgente]);

  const subtitle = appliedRange
    ? `Rango: ${formatDateRange(appliedRange.start, appliedRange.end)}`
    : "Resumen de soporte corporativo — últimos 30 días.";

  return (
    <div className="bg-[#F8F8FC] min-h-[calc(100vh-72px)] p-8">
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-gray-800 font-inter leading-tight">
            Panel de Analítica
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-inter">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 items-end">
          <div className="flex items-center gap-3">
            {agentes.length > 0 && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11">
                <User size={16} color="#6B7280" strokeWidth={2} />
                <select
                  value={selectedAgente}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="h-full border-none bg-transparent text-[13px] font-medium text-gray-700 font-inter cursor-pointer outline-none min-w-[140px]"
                >
                  <option value="">Todos los técnicos</option>
                  {agentes.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            <AnalyticsFilters
              filter={filter}
              showDatePicker={showDatePicker}
              startDate={startDate}
              endDate={endDate}
              appliedRange={appliedRange}
              metrics={metrics}
              areaData={areaData}
              donutData={donutData}
              onFilterChange={handleFilterChange}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              onApplyRange={handleApplyRange}
              onCancelRange={handleCancelRange}
            />
          </div>
        </div>
      </div>

      <AnalyticsMetrics metrics={metrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 font-inter">
                Incidentes vs. Resueltos
              </h3>
              <p className="mt-1 text-[13px] text-gray-500 font-inter">
                Evolución de tickets en el tiempo
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#25207E]" />
                <span className="text-xs text-gray-500 font-inter">Incidentes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#A1A1AA]" />
                <span className="text-xs text-gray-500 font-inter">Resueltos</span>
              </div>
            </div>
          </div>
          <TrafficChart data={areaData} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 font-inter">
              Distribución por Urgencia
            </h3>
            <p className="mt-1 text-[13px] text-gray-500 font-inter">
              Desglose de incidentes por nivel
            </p>
          </div>
          <DonutChart data={donutData} />
        </div>
      </div>

      {/* Status Bar Chart */}
      <div className="mt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 font-inter">
              Incidentes por Estado
            </h3>
            <p className="mt-1 text-[13px] text-gray-500 font-inter">
              {selectedAgente ? `Técnico: ${selectedAgente}` : "Todos los técnicos"} — Pendientes, en proceso y resueltos
            </p>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
              <span className="text-xs text-gray-500 font-inter">Pendientes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#7C3AED]" />
              <span className="text-xs text-gray-500 font-inter">En Proceso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#22C55E]" />
              <span className="text-xs text-gray-500 font-inter">Resueltos</span>
            </div>
          </div>
          <StatusBarChart data={statusData} />
        </div>
      </div>
    </div>
  );
}
