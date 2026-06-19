"use client";

interface RatingRow {
  puntuacion: number;
  comentario: string | null;
  created_at: string;
  usuario_nombre: string;
  punto_venta: string;
  ticket_descripcion: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  ratings: RatingRow[];
}

export default function RecentRatingsTable({ ratings }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
        Últimas calificaciones
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F3F4F6] dark:border-gray-700">
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Usuario</th>
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Punto de Venta</th>
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Ticket</th>
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Calificación</th>
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Comentario</th>
              <th className="py-3 px-3 text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r, i) => (
              <tr key={i} className="border-b border-[#F3F4F6] dark:border-gray-700 hover:bg-[#F9FAFB] dark:hover:bg-gray-800">
                <td className="py-3 px-3"><span className="text-[13px] font-medium text-[#1F2937] dark:text-gray-100 font-inter">{r.usuario_nombre}</span></td>
                <td className="py-3 px-3"><span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">{r.punto_venta}</span></td>
                <td className="py-3 px-3 max-w-[200px]"><span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter truncate block">{r.ticket_descripcion}</span></td>
                <td className="py-3 px-3"><span className="text-sm text-[#F59E0B]">{"★".repeat(r.puntuacion)}{"☆".repeat(5 - r.puntuacion)}</span></td>
                <td className="py-3 px-3 max-w-[300px]">
                  {r.comentario ? (
                    <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter block break-words">{r.comentario}</span>
                  ) : (
                    <span className="text-[13px] text-[#D1D5DB] dark:text-gray-600 font-inter italic">—</span>
                  )}
                </td>
                <td className="py-3 px-3"><span className="text-[12px] text-[#9CA3AF] dark:text-gray-400 font-inter whitespace-nowrap">{formatDate(r.created_at)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
