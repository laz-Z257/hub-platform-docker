"use client";

interface Props { promedio: number; total: number; pvCount: number; distribucion: Record<string, number> }

export default function RatingSummaryCards({ promedio, total, pvCount, distribucion }: Props) {
  const pctPositivas = total > 0 ? Math.round(((distribucion["4"] || 0) + (distribucion["5"] || 0)) / total * 100) : 0;

  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      <Card label="Promedio" value={promedio.toFixed(1)} />
      <Card label="Total" value={total.toLocaleString()} />
      <Card label="Positivas" value={`${pctPositivas}%`} color="#22C55E" />
      <Card label="PV calificados" value={pvCount.toLocaleString()} />
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <p className="text-[13px] font-semibold text-gray-400 dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-1">{label}</p>
      <p className="text-4xl font-bold font-inter text-gray-800" style={{ color }}>{value}</p>
    </div>
  );
}
