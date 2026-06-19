"use client";

interface RatingRow {
  puntuacion: number; comentario: string | null; created_at: string;
  usuario_nombre: string; punto_venta: string; ticket_descripcion: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

interface Props { ratings: RatingRow[] }

export default function RecentRatingsTable({ ratings }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase mb-3">Últimas calificaciones</h3>
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {ratings.map((r, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#F3F4F6] dark:border-gray-800 last:border-0 text-xs">
            <span className="font-medium text-[#1F2937] dark:text-gray-100 font-inter w-20 truncate shrink-0">{r.usuario_nombre}</span>
            <span className="text-[#6B7280] font-inter w-20 truncate shrink-0">{r.punto_venta}</span>
            <span className="text-[#F59E0B] shrink-0">{"★".repeat(r.puntuacion)}</span>
            <span className="text-[#6B7280] font-inter flex-1 truncate">{r.comentario || "—"}</span>
            <span className="text-[#9CA3AF] font-inter shrink-0">{fmt(r.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
