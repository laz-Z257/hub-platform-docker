"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, Users, MapPin, MessageSquare, ThumbsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { api } from "@/lib/api";

interface RatingWithDetails {
  puntuacion: number;
  comentario: string | null;
  created_at: string;
  incident_id: string;
  usuario_nombre: string;
  punto_venta: string;
  ticket_descripcion: string;
}

interface PromedioPv {
  punto_venta: string;
  promedio: number;
  total: number;
}

interface RatingStats {
  promedio: number;
  total: number;
  distribucion: Record<string, number>;
  promedioPv: PromedioPv[];
  ultimas: RatingWithDetails[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
  });
}

const STAR_COLORS = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E"];
const PIE_COLORS = ["#22C55E", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];

const starLabels: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

export default function RatingsPage() {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RatingStats>("/ratings")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8 flex items-center justify-center">
        <p className="text-[#6B7280] font-inter text-sm">Cargando calificaciones...</p>
      </div>
    );
  }

  const distData = [5, 4, 3, 2, 1].map((star) => ({
    name: starLabels[star],
    valor: star,
    cantidad: stats?.distribucion[String(star)] || 0,
  }));

  const pieData = distData
    .filter((d) => d.cantidad > 0)
    .map((d) => ({ name: `${d.valor} ★`, value: d.cantidad }));

  const pvChartData = stats?.promedioPv.map((pv) => ({
    name: pv.punto_venta.length > 12 ? pv.punto_venta.slice(0, 12) + "…" : pv.punto_venta,
    promedio: pv.promedio,
    total: pv.total,
  })) || [];

  return (
    <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8">
      <div className="mb-7">
        <h1 className="text-[42px] font-bold text-[#25207E] font-inter leading-tight">
          Calificaciones
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
          Encuestas de satisfacción enviadas por los usuarios después de resolver sus tickets.
        </p>
      </div>

      {!stats || stats.total === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-12 text-center">
          <Star size={48} color="#9CA3AF" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
            No hay calificaciones todavía. Las calificaciones aparecerán aquí cuando los usuarios evalúen sus tickets resueltos.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-5 mb-6">
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <Star size={20} color="#F59E0B" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  Promedio
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                  {stats.promedio.toFixed(1)}
                </span>
                <span className="text-sm text-[#F59E0B]">
                  {"★".repeat(Math.round(stats.promedio))}{"☆".repeat(5 - Math.round(stats.promedio))}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <TrendingUp size={20} color="#25207E" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  Total
                </span>
              </div>
              <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                {stats.total}
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                  <ThumbsUp size={20} color="#22C55E" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  % Positivas
                </span>
              </div>
              <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                {Math.round(((stats.distribucion["4"] || 0) + (stats.distribucion["5"] || 0)) / stats.total * 100)}%
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
                  <MapPin size={20} color="#25207E" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  Puntos de venta
                </span>
              </div>
              <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                {stats.promedioPv.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
                Distribución por estrella
              </h3>
              <div className="space-y-3">
                {distData.map((d) => {
                  const pct = stats.total > 0 ? (d.cantidad / stats.total) * 100 : 0;
                  return (
                    <div key={d.valor} className="flex items-center gap-3">
                      <span className="w-16 text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">
                        {d.name}
                      </span>
                      <span className="w-5 text-[13px] text-[#1F2937] dark:text-gray-100 font-inter font-semibold">
                        {d.valor}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#F3F4F6] dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: STAR_COLORS[d.valor - 1] }}
                        />
                      </div>
                      <span className="w-10 text-right text-[12px] text-[#6B7280] dark:text-gray-400 font-inter">
                        {d.cantidad}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
                Gráfico de distribución
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                    formatter={(value) => [value, "Calificaciones"]}
                  />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                    {distData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
                Promedio por punto de venta
              </h3>
              {pvChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pvChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                      formatter={(value) => [typeof value === "number" ? value.toFixed(1) : value, "Promedio"]}
                    />
                    <Bar dataKey="promedio" radius={[0, 6, 6, 0]} fill="#25207E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[#9CA3AF] dark:text-gray-400 font-inter text-center py-12">Sin datos</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
              Últimas calificaciones
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F3F4F6] dark:border-gray-700">
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Usuario</th>
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Punto de Venta</th>
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Ticket</th>
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Calificación</th>
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Comentario</th>
                    <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.5px]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ultimas.map((r, i) => (
                    <tr key={i} className="border-b border-[#F3F4F6] dark:border-gray-700 hover:bg-[#F9FAFB] dark:hover:bg-gray-800">
                      <td className="py-3 px-3">
                        <span className="text-[13px] font-medium text-[#1F2937] dark:text-gray-100 font-inter">
                          {r.usuario_nombre}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">
                          {r.punto_venta}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter truncate block">
                          {r.ticket_descripcion}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm text-[#F59E0B]">
                          {"★".repeat(r.puntuacion)}{"☆".repeat(5 - r.puntuacion)}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        {r.comentario ? (
                          <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter truncate block">
                            {r.comentario}
                          </span>
                        ) : (
                          <span className="text-[13px] text-[#D1D5DB] dark:text-gray-600 font-inter italic">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[12px] text-[#9CA3AF] dark:text-gray-400 font-inter whitespace-nowrap">
                          {formatDate(r.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
