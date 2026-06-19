"use client";

import { Star, TrendingUp, ThumbsUp, MapPin } from "lucide-react";

interface Props {
  promedio: number;
  total: number;
  pvCount: number;
  distribucion: Record<string, number>;
}

export default function RatingSummaryCards({ promedio, total, pvCount, distribucion }: Props) {
  const pctPositivas = total > 0 ? Math.round(((distribucion["4"] || 0) + (distribucion["5"] || 0)) / total * 100) : 0;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Card icon={<Star size={16} color="#F59E0B" />} bg="#FFF7ED" label="Promedio" value={promedio.toFixed(1)} />
      <Card icon={<TrendingUp size={16} color="#25207E" />} bg="#EEF2FF" label="Total" value={total.toLocaleString()} />
      <Card icon={<ThumbsUp size={16} color="#22C55E" />} bg="#F0FDF4" label="% Positivas" value={`${pctPositivas}%`} />
      <Card icon={<MapPin size={16} color="#25207E" />} bg="#F3F0FF" label="Puntos de venta" value={pvCount.toLocaleString()} />
    </div>
  );
}

function Card({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>{icon}</div>
      <div>
        <p className="text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">{label}</p>
        <p className="text-xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">{value}</p>
      </div>
    </div>
  );
}
