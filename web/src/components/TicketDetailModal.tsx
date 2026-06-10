"use client";

import { X, Clock, User, Phone, MapPin, AlertCircle } from "lucide-react";

interface IncidentDetail {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  punto_venta: string;
  descripcion: string;
  urgencia: string;
  estado: string;
  agente: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketDetailModalProps {
  incident: IncidentDetail | null;
  onClose: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  alta: "#EF4444",
  media: "#F59E0B",
  baja: "#22C55E",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  resuelto: "Resuelto",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "#3B82F6",
  en_proceso: "#7C3AED",
  resuelto: "#22C55E",
};

function formatTicketId(id: string): string {
  const short = id.slice(-4).toUpperCase();
  return `#TK-${short}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetailModal({ incident, onClose }: TicketDetailModalProps) {
  if (!incident) return null;

  const status = STATUS_LABELS[incident.estado] || incident.estado;
  const statusColor = STATUS_COLORS[incident.estado] || "#6B7280";
  const priorityColor = PRIORITY_COLORS[incident.urgencia] || "#6B7280";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[100] p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[560px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-gray-900/30 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#F8F8FC] dark:bg-gray-950 px-6 py-5 border-b border-[#E5E7EB] dark:border-gray-700 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-base font-bold text-[#25207E] font-inter">
                {formatTicketId(incident.id)}
              </span>
              <span
                className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter text-white"
                style={{ backgroundColor: priorityColor }}
              >
                {incident.urgencia.toUpperCase()}
              </span>
              <span
                className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter text-white"
                style={{ backgroundColor: statusColor }}
              >
                {status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1F2937] dark:text-gray-100 font-inter leading-snug">
              {incident.descripcion}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer shrink-0 ml-4"
          >
            <X size={14} color="#6B7280" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <InfoBlock icon={User} label="Solicitante" value={incident.nombre} />
          <InfoBlock icon={User} label="Documento" value={incident.documento} />
          <InfoBlock icon={Phone} label="Teléfono" value={incident.telefono || "—"} />
          <InfoBlock icon={MapPin} label="Punto de Venta" value={incident.punto_venta} />
          <InfoBlock icon={AlertCircle} label="Urgencia" value={incident.urgencia.charAt(0).toUpperCase() + incident.urgencia.slice(1)} />
          <InfoBlock icon={Clock} label="Estado" value={status} />
          <div className="col-span-2">
            <InfoBlock icon={User} label="Agente Asignado" value={incident.agente || "Sin asignar"} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F8FC] dark:bg-gray-950 px-6 py-3 border-t border-[#E5E7EB] dark:border-gray-700 flex justify-between items-center">
          <span className="text-[11px] text-[#9CA3AF] dark:text-gray-400 font-inter">
            Creado: {formatDate(incident.created_at)}
          </span>
          <span className="text-[11px] text-[#9CA3AF] dark:text-gray-400 font-inter">
            Actualizado: {formatDate(incident.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} color="#25207E" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
          {label}
        </p>
        <p className="text-[13px] font-medium text-[#1F2937] dark:text-gray-100 font-inter mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
