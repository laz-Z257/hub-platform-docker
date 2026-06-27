"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E"];

interface DistItem { name: string; valor: number; cantidad: number }
interface PvChartItem { name: string; promedio: number; total: number }
interface Props { distData: DistItem[]; pvChartData: PvChartItem[] }

export default function RatingCharts({ distData, pvChartData }: Props) {
  const total = distData.reduce((s, i) => s + i.cantidad, 0);
  const ratedPvs = pvChartData.filter((d) => d.total > 0);

  return (
    <div>
      {/* Fila 1: Distribución por estrella */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-[13px] font-semibold text-gray-400 dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">Distribución por estrella</h3>
        <div className="space-y-3">
          {distData.map((d) => {
            const pct = total > 0 ? (d.cantidad / total) * 100 : 0;
            return (
              <div key={d.valor} className="flex items-center gap-3">
                <span className="text-sm text-amber-500 shrink-0">{["★", "★★", "★★★", "★★★★", "★★★★★"][d.valor - 1]}</span>
                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[d.valor - 1] }} />
                </div>
                <span className="w-8 text-sm text-right text-gray-500 dark:text-gray-400 font-inter">{d.cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fila 2: Promedio por PV */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mt-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-semibold text-gray-400 dark:text-gray-400 font-inter uppercase tracking-[0.3px]">Promedio por punto de venta</h3>
          <span className="text-[11px] text-gray-400 font-inter">{ratedPvs.length} calificados</span>
        </div>
        {ratedPvs.length > 0 ? (
          <div style={{ height: `${Math.min(360, Math.max(120, ratedPvs.length * 32 + 20))}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratedPvs} layout="vertical" margin={{ left: 5, right: 5 }}>
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis type="category" dataKey="name" width={230} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [typeof v === "number" ? v.toFixed(1) : "0", "Promedio"]} />
                <Bar dataKey="promedio" radius={[0, 6, 6, 0]} fill="#25207E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-sm text-gray-400 dark:text-gray-400 font-inter text-center py-8">Sin calificaciones</p>}
      </div>

    </div>
  );
}
