"use client";

import Link from "next/link";

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  ALTA: { bg: "#DBEAFE", color: "#2563EB" },
  MEDIA: { bg: "#F3F0FF", color: "#7C3AED" },
  BAJA: { bg: "#F3F4F6", color: "#6B7280" },
};

const STATUS_COLORS: Record<string, string> = {
  "En Proceso": "#FBBF24",
  Pendiente: "#3B82F6",
  Resuelto: "#22C55E",
};

function mapPriority(urgencia: string): string {
  const map: Record<string, string> = {
    alta: "ALTA",
    media: "MEDIA",
    baja: "BAJA",
  };
  return map[urgencia] || urgencia.toUpperCase();
}

function mapStatus(estado: string): string {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    resuelto: "Resuelto",
  };
  return map[estado] || estado;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface TicketsTableProps {
  incidents: {
    id: string;
    nombre?: string;
    descripcion?: string;
    asunto?: string;
    urgencia?: string;
    prioridad?: string;
    estado?: string;
    created_at?: string;
  }[];
}

export default function TicketsTable({ incidents }: TicketsTableProps) {
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const tickets = safeIncidents.map((inc) => ({
    id: inc.id,
    nombre: inc.nombre || "Anónimo",
    asunto: inc.asunto || (inc.descripcion ? (inc.descripcion.length > 45 ? inc.descripcion.slice(0, 45) + "..." : inc.descripcion) : "Sin descripción"),
    prioridad: inc.prioridad || mapPriority(inc.urgencia || "media"),
    estado: inc.estado ? mapStatus(inc.estado) : "Pendiente",
    fecha: inc.created_at ? formatDate(inc.created_at) : "—",
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-800 font-inter">
          Tickets Recientes
        </h3>
        <Link
          href="/dashboard/tickets"
          className="no-underline text-[13px] font-medium text-[#25207E] font-inter"
        >
          Ver todo &rarr;
        </Link>
      </div>

      {tickets.length === 0 ? (
        <p className="text-center text-gray-400 font-inter py-8">
          No hay tickets recientes.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["USUARIO", "ASUNTO", "PRIORIDAD", "FECHA", "ESTADO"].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-gray-400 font-inter uppercase tracking-[0.5px]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, i) => (
              <tr key={ticket.id} className="border-t border-gray-100">
                <td className="px-3 py-3 text-[13px] font-medium text-gray-800 font-inter">
                  {ticket.nombre}
                </td>
                <td className="px-3 py-3 text-[13px] font-medium text-gray-800 font-inter">
                  {ticket.asunto}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter"
                    style={{
                      backgroundColor:
                        PRIORITY_STYLES[ticket.prioridad]?.bg || "#F3F4F6",
                      color:
                        PRIORITY_STYLES[ticket.prioridad]?.color || "#6B7280",
                    }}
                  >
                    {ticket.prioridad}
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px] text-gray-500 font-inter">
                  {ticket.fecha}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[ticket.estado] || "#D1D5DB",
                      }}
                    />
                    <span className="text-[13px] text-gray-700 font-inter">
                      {ticket.estado}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
