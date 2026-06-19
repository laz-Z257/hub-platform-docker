"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E"];

interface DistItem { name: string; valor: number; cantidad: number }
interface PvChartItem { name: string; promedio: number; total: number }
interface Props { distData: DistItem[]; pvChartData: PvChartItem[] }

export default function RatingCharts({ distData, pvChartData }: Props) {
  const total = distData.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="flex gap-4">
      {/* Distribución por estrella */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase mb-3">Distribución</h3>
        <div className="space-y-2">
          {distData.map((d) => {
            const pct = total > 0 ? (d.cantidad / total) * 100 : 0;
            return (
              <div key={d.valor} className="flex items-center gap-2">
                <span className="w-4 text-xs text-[#6B7280] font-inter text-right">{d.valor}</span>
                <span className="text-[11px] text-[#F59E0B] shrink-0">{["★", "★★", "★★★", "★★★★", "★★★★★"][d.valor - 1]}</span>
                <div className="flex-1 h-2.5 bg-[#F3F4F6] dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[d.valor - 1] }} />
                </div>
                <span className="w-8 text-[11px] text-right text-[#6B7280] font-inter">{d.cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promedio por PV */}
      <div className="flex-[2] bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase mb-3">Promedio por punto de venta</h3>
        {pvChartData.length > 0 ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pvChartData} layout="vertical" margin={{ left: 5, right: 5 }}>
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 9, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 11 }} formatter={(v) => [typeof v === "number" ? v.toFixed(1) : "0", "Promedio"]} />
                <Bar dataKey="promedio" radius={[0, 4, 4, 0]} fill="#25207E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-xs text-[#9CA3AF] text-center py-4">Sin datos</p>}
      </div>
    </div>
  );
}
