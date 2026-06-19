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
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">Últimas calificaciones</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {ratings.map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] dark:border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-[#F3F0FF] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-[#25207E] font-inter">{r.usuario_nombre.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1F2937] dark:text-gray-100 font-inter truncate">{r.usuario_nombre}</p>
              <p className="text-[11px] text-[#6B7280] font-inter truncate">{r.punto_venta}</p>
            </div>
            <span className="text-sm text-[#F59E0B] shrink-0">{"★".repeat(r.puntuacion)}</span>
            <span className="text-[11px] text-[#9CA3AF] font-inter shrink-0">{fmt(r.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
