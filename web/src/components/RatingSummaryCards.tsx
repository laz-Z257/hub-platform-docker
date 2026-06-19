"use client";

interface Props { promedio: number; total: number; pvCount: number; distribucion: Record<string, number> }

export default function RatingSummaryCards({ promedio, total, pvCount, distribucion }: Props) {
  const pctPositivas = total > 0 ? Math.round(((distribucion["4"] || 0) + (distribucion["5"] || 0)) / total * 100) : 0;

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1 bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg px-4 py-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase">Promedio</p>
        <p className="text-2xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">{promedio.toFixed(1)}</p>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg px-4 py-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase">Total</p>
        <p className="text-2xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">{total.toLocaleString()}</p>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg px-4 py-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase">Positivas</p>
        <p className="text-2xl font-bold text-[#22C55E] font-inter">{pctPositivas}%</p>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg px-4 py-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] font-inter uppercase">PV calificados</p>
        <p className="text-2xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">{pvCount.toLocaleString()}</p>
      </div>
    </div>
  );
}
