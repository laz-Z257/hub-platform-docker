"use client";

import { Star, TrendingUp, ThumbsUp, MapPin } from "lucide-react";

interface Props {
  promedio: number;
  total: number;
  pvCount: number;
  distribucion: Record<string, number>;
}

export default function RatingSummaryCards({ promedio, total, pvCount, distribucion }: Props) {
  const pctPositivas = total > 0
    ? Math.round(((distribucion["4"] || 0) + (distribucion["5"] || 0)) / total * 100)
    : 0;

  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      <MetricCard
        icon={<Star size={20} color="#F59E0B" strokeWidth={2} />}
        iconBg="#FFF7ED"
        label="Promedio"
        value={promedio.toFixed(1)}
        extra={<span className="text-sm text-[#F59E0B]">{"★".repeat(Math.round(promedio))}{"☆".repeat(5 - Math.round(promedio))}</span>}
      />
      <MetricCard
        icon={<TrendingUp size={20} color="#25207E" strokeWidth={2} />}
        iconBg="#EEF2FF"
        label="Total"
        value={total.toLocaleString()}
      />
      <MetricCard
        icon={<ThumbsUp size={20} color="#22C55E" strokeWidth={2} />}
        iconBg="#F0FDF4"
        label="% Positivas"
        value={`${pctPositivas}%`}
      />
      <MetricCard
        icon={<MapPin size={20} color="#25207E" strokeWidth={2} />}
        iconBg="#F3F0FF"
        label="Puntos de venta"
        value={pvCount.toLocaleString()}
      />
    </div>
  );
}

function MetricCard({ icon, iconBg, label, value, extra }: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">{value}</span>
        {extra}
      </div>
    </div>
  );
}
