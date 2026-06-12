"use client";

import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, Clock, Activity } from "lucide-react";
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
import { api } from "@/lib/api";

interface KpiResponse {
  totalIncidentes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
  usuariosActivos: number;
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
  const [metrics, setMetrics] = useState<{ icon: LucideIcon; title: string; value: string; desc: string }[]>([]);
  const [areaData, setAreaData] = useState<AreaDataPoint[]>([]);
  const [donutData, setDonutData] = useState<DonutDataPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusBarDataPoint[]>([]);

  useEffect(() => {
    const range = getDefaultRange();
    const params = new URLSearchParams({ start: range.start, end: range.end });
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
            name: "General",
            pendientes: stats.statusCounts.pendientes,
            enProceso: stats.statusCounts.enProceso,
            resueltos: stats.statusCounts.resueltos,
          }]);
        }
      })
      .catch((err) => {
        console.error("Analytics stats:", err instanceof Error ? err.message : err);
      });
  }, []);

  return (
    <div className="bg-[#F8F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8">
      <div className="mb-7">
        <h1 className="text-[42px] font-bold text-gray-800 dark:text-gray-100 font-inter leading-tight">
          Panel de Analítica
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 font-inter">
          Resumen de soporte corporativo — últimos 30 días.
        </p>
      </div>

      <AnalyticsMetrics metrics={metrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 font-inter">
                Incidentes vs. Resueltos
              </h3>
              <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 font-inter">
                Evolución de tickets en el tiempo
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#25207E]" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">Incidentes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#A1A1AA]" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">Resueltos</span>
              </div>
            </div>
          </div>
          <TrafficChart data={areaData} />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 font-inter">
              Distribución por Urgencia
            </h3>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 font-inter">
              Desglose de incidentes por nivel
            </p>
          </div>
          <DonutChart data={donutData} />
        </div>
      </div>

      {/* Status Bar Chart */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 font-inter">
              Incidentes por Estado
            </h3>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 font-inter">
              Todos los técnicos — Pendientes, en proceso y resueltos
            </p>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">Pendientes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#7C3AED]" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">En Proceso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#22C55E]" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">Resueltos</span>
            </div>
          </div>
          <StatusBarChart data={statusData} />
        </div>
      </div>
    </div>
  );
}
