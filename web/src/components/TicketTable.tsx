"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Eye, CheckCircle, Clock, Loader, UserPlus } from "lucide-react";

interface TicketRow {
  id: string;
  asunto: string;
  categoria: string;
  solicitante: string;
  prioridad: string;
  estado: string;
  updatedAt: string;
  agente?: string | null;
}

const PRIORITY_BADGES: Record<string, { bg: string; text: string }> = {
  CRÍTICA: { bg: "#FEE2E2", text: "#DC2626" },
  ALTA: { bg: "#25207E", text: "#FFFFFF" },
  MEDIA: { bg: "#E9D5FF", text: "#7C3AED" },
  BAJA: { bg: "#E5E7EB", text: "#6B7280" },
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  Abierto: { bg: "#DBEAFE", text: "#2563EB" },
  "En Proceso": { bg: "#E9D5FF", text: "#7C3AED" },
  Resuelto: { bg: "#E2E8F0", text: "#475569" },
};

function formatTicketId(id: string): string {
  const short = id.slice(-4).toUpperCase();
  return `#TK-${short}`;
}

interface TicketTableProps {
  tickets: TicketRow[];
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onViewDetail: (ticketId: string) => void;
  onAssignAgent: (ticketId: string, agent: string) => void;
}

function ActionMenu({
  ticketId,
  currentStatus,
  currentAgente,
  onStatusChange,
  onViewDetail,
  onAssignAgent,
}: {
  ticketId: string;
  currentStatus: string;
  currentAgente?: string | null;
  onStatusChange: (id: string, status: string) => void;
  onViewDetail: (id: string) => void;
  onAssignAgent: (id: string, agent: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [agentInput, setAgentInput] = useState(currentAgente || "");
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  useEffect(() => {
    setAgentInput(currentAgente || "");
  }, [currentAgente, open]);

  const statusOptions = [
    { label: "Pendiente", value: "pendiente", icon: Clock, color: "#3B82F6" },
    { label: "En Proceso", value: "en_proceso", icon: Loader, color: "#7C3AED" },
    { label: "Resuelto", value: "resuelto", icon: CheckCircle, color: "#22C55E" },
  ];

  const safeStatus = currentStatus === "Abierto" ? "pendiente" : currentStatus === "En Proceso" ? "en_proceso" : "resuelto";

  const handleAssign = () => {
    const name = agentInput.trim();
    if (name) {
      onAssignAgent(ticketId, name);
    }
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:border-[#E5E7EB] hover:bg-white bg-transparent cursor-pointer"
      >
        <MoreVertical size={14} color="#9CA3AF" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E5E7EB] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50 py-1.5">
          <button
            onClick={() => {
              onViewDetail(ticketId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#374151] font-inter hover:bg-[#F9FAFB] bg-transparent border-none cursor-pointer text-left"
          >
            <Eye size={15} color="#6B7280" />
            Ver detalle
          </button>

          <div className="border-t border-[#F3F4F6] my-1" />

          <div className="px-3 pb-1">
            <p className="px-1 py-1.5 text-[10px] font-semibold text-[#9CA3AF] font-inter uppercase tracking-[0.5px]">
              Asignar técnico
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAssign();
                }}
                placeholder="Nombre del técnico"
                className="flex-1 h-[30px] px-2.5 rounded-md border border-[#E5E7EB] text-[12px] text-[#1F2937] font-inter outline-none focus:border-[#25207E] bg-white"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleAssign}
                className="h-[30px] px-2.5 rounded-md bg-[#25207E] border-none cursor-pointer flex items-center justify-center shrink-0"
              >
                <UserPlus size={13} color="#FFFFFF" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="border-t border-[#F3F4F6] my-1" />

          <div className="px-2 pb-1">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-[#9CA3AF] font-inter uppercase tracking-[0.5px]">
              Cambiar estado
            </p>
            {statusOptions
              .filter((opt) => opt.value !== safeStatus)
              .map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onStatusChange(ticketId, opt.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-inter bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] rounded-md text-left"
                  style={{ color: opt.color }}
                >
                  <opt.icon size={13} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketTable({ tickets, onStatusChange, onViewDetail, onAssignAgent }: TicketTableProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-visible">
      <div className="grid grid-cols-[100px_1fr_140px_100px_110px_120px_60px] bg-[#EEF2FF] px-5">
        {["ID TICKET", "ASUNTO", "SOLICITANTE", "PRIORIDAD", "ESTADO", "ÚLTIMA ACT.", "ACCIONES"].map(
          (col) => (
            <div
              key={col}
              className="py-3.5 px-2 text-[11px] font-semibold text-[#4B5563] font-inter uppercase tracking-[0.5px]"
            >
              {col}
            </div>
          )
        )}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#9CA3AF] font-inter">No se encontraron tickets</p>
        </div>
      )}
      {(Array.isArray(tickets) ? tickets : []).map((ticket) => (
        <div
          key={ticket.id}
          className="grid grid-cols-[100px_1fr_140px_100px_110px_120px_60px] px-5 border-t border-[#F3F4F6] items-center min-h-[56px]"
        >
          <div className="py-3 px-2">
            <span className="text-[13px] font-medium text-[#25207E] font-inter">
              {formatTicketId(ticket.id)}
            </span>
          </div>

          <div className="py-3 px-2">
            <p className="text-[13px] font-semibold text-[#1F2937] font-inter">
              {ticket.asunto}
            </p>
            <p className="text-[11px] text-[#9CA3AF] font-inter mt-0.5">
              {ticket.categoria}
            </p>
          </div>

          <div className="py-3 px-2">
            <span className="text-[13px] text-[#1F2937] font-inter font-medium">
              {ticket.solicitante}
            </span>
          </div>

          <div className="py-3 px-2">
            <span
              className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter"
              style={{
                backgroundColor: PRIORITY_BADGES[ticket.prioridad]?.bg || "#E5E7EB",
                color: PRIORITY_BADGES[ticket.prioridad]?.text || "#6B7280",
              }}
            >
              {ticket.prioridad}
            </span>
          </div>

          <div className="py-3 px-2">
            <span
              className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter"
              style={{
                backgroundColor: STATUS_BADGES[ticket.estado]?.bg || "#DBEAFE",
                color: STATUS_BADGES[ticket.estado]?.text || "#2563EB",
              }}
            >
              {ticket.estado}
            </span>
          </div>

          <div className="py-3 px-2">
            <span className="text-[12px] text-[#6B7280] font-inter">
              {ticket.updatedAt}
            </span>
          </div>

          <div className="py-3 px-2 flex justify-center">
            <ActionMenu
              ticketId={ticket.id}
              currentStatus={ticket.estado}
              currentAgente={ticket.agente}
              onStatusChange={onStatusChange}
              onViewDetail={onViewDetail}
              onAssignAgent={onAssignAgent}
            />
          </div>
        </div>
      ))}
      </div>
  );
}
