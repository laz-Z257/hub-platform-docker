"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DistItem {
  name: string;
  valor: number;
  cantidad: number;
}

interface PvChartItem {
  name: string;
  promedio: number;
  total: number;
}

const STAR_COLORS = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E"];
const PIE_COLORS = ["#22C55E", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];

interface Props {
  distData: DistItem[];
  pvChartData: PvChartItem[];
  pvSourceLength: number;
}

export default function RatingCharts({ distData, pvChartData, pvSourceLength }: Props) {
  const pieData = distData.filter((d) => d.cantidad > 0).map((d) => ({ name: `${d.valor} ★`, value: d.cantidad }));

  return (
    <div className="grid grid-cols-3 gap-5 mb-6">
      {/* Distribución por estrella */}
      <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
          Distribución por estrella
        </h3>
        <div className="space-y-3">
          {distData.map((d) => {
            const total = distData.reduce((s, i) => s + i.cantidad, 0);
            const pct = total > 0 ? (d.cantidad / total) * 100 : 0;
            return (
              <div key={d.valor} className="flex items-center gap-3">
                <span className="w-16 text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">{d.name}</span>
                <span className="w-5 text-[13px] text-[#1F2937] dark:text-gray-100 font-inter font-semibold">{d.valor}</span>
                <div className="flex-1 h-2.5 bg-[#F3F4F6] dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: STAR_COLORS[d.valor - 1] }} />
                </div>
                <span className="w-10 text-right text-[12px] text-[#6B7280] dark:text-gray-400 font-inter">{d.cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
          Gráfico de distribución
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={distData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(value) => [value, "Calificaciones"]} />
            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
              {distData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i]} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Promedio por PV */}
      <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
          Promedio por punto de venta
        </h3>
        {pvSourceLength > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(220, pvSourceLength * 35)}>
            <BarChart data={pvChartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#6B7280" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(value) => [typeof value === "number" ? value.toFixed(1) : "0", "Promedio"]} />
              <Bar dataKey="promedio" radius={[0, 6, 6, 0]} fill="#25207E" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[#9CA3AF] dark:text-gray-400 font-inter text-center py-12">Sin datos</p>
        )}
      </div>
    </div>
  );
}
