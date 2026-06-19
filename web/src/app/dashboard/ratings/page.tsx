"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import RatingSummaryCards from "@/components/RatingSummaryCards";
import RatingCharts from "@/components/RatingCharts";
import RecentRatingsTable from "@/components/RecentRatingsTable";

interface RatingStats {
  promedio: number;
  total: number;
  distribucion: Record<string, number>;
  promedioPv: { punto_venta: string; promedio: number; total: number }[];
  ultimas: {
    puntuacion: number; comentario: string | null; created_at: string;
    incident_id: string; usuario_nombre: string; punto_venta: string; ticket_descripcion: string;
  }[];
}

const starLabels: Record<number, string> = { 1: "Muy malo", 2: "Malo", 3: "Regular", 4: "Bueno", 5: "Excelente" };

export default function RatingsPage() {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPvNames, setAllPvNames] = useState<string[]>([]);

  useEffect(() => {
    api.get<RatingStats>("/ratings").then(setStats).catch(() => {}).finally(() => setLoading(false));
    api.get<{ nombre: string }[]>("/puntos-venta").then((list) => setAllPvNames(list.map((p) => p.nombre))).catch(() => {});
  }, []);

  if (loading) return <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-screen p-8 flex items-center justify-center"><p className="text-[#6B7280] text-sm font-inter">Cargando...</p></div>;

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-screen p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-inter mb-1">Calificaciones</h1>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 font-inter mb-6">Encuestas de satisfacción de los usuarios.</p>
        <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-12 text-center">
          <Star size={48} color="#9CA3AF" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400 font-inter">No hay calificaciones todavía.</p>
        </div>
      </div>
    );
  }

  const distData = [5, 4, 3, 2, 1].map((star) => ({
    name: starLabels[star], valor: star, cantidad: stats.distribucion[String(star)] || 0,
  }));

  const pvMap = new Map<string, { promedio: number; total: number }>();
  for (const pv of stats.promedioPv) pvMap.set(pv.punto_venta, { promedio: pv.promedio, total: pv.total });

  const pvSource = allPvNames.length > 0 ? allPvNames : [...pvMap.keys()];
  const pvChartData = pvSource.map((name) => {
    const d = pvMap.get(name) || { promedio: 0, total: 0 };
    return { name: name.length > 14 ? name.slice(0, 14) + "…" : name, promedio: d.promedio, total: d.total };
  }).sort((a, b) => b.promedio - a.promedio || b.total - a.total);

  return (
    <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-inter mb-1">Calificaciones</h1>
      <p className="text-sm text-[#6B7280] dark:text-gray-400 font-inter mb-4">Encuestas de satisfacción de los usuarios.</p>

      <RatingSummaryCards promedio={stats.promedio} total={stats.total} pvCount={stats.promedioPv.length} distribucion={stats.distribucion} />

      <div className="flex gap-4 items-start">
        <div className="flex-[3] min-w-0 space-y-4">
          <RatingCharts distData={distData} pvChartData={pvChartData} pvSourceLength={pvSource.length} />
        </div>
        <div className="flex-[2] min-w-0">
          <RecentRatingsTable ratings={stats.ultimas} />
        </div>
      </div>
    </div>
  );
}
