"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Eye, CheckCircle, Clock, Loader, UserPlus } from "lucide-react";
import { STATUS_ACTION_COLORS, TICKET_STATUS_BADGES } from "@/lib/styles";

interface TicketRow {
  id: string;
  asunto: string;
  categoria: string;
  solicitante: string;
  estado: string;
  createdAt: string;
  fechaCierre: string | null;
  agente?: string | null;
}

const STATUS_BADGES: Record<string, string> = {
  Abierto: "bg-blue-100 text-blue-600",
  "En Proceso": "bg-purple-100 text-purple-600",
  Resuelto: "bg-slate-100 text-slate-600",
};

function formatTicketId(id: string): string {
  const short = id.replace(/-/g, "").slice(-8).toUpperCase();
  return `#TK-${short}`;
}

interface TicketTableProps {
  tickets: TicketRow[];
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onViewDetail: (ticketId: string) => void;
  onAssignAgent: (ticketId: string, agent: string) => void;
  onResolve?: (ticketId: string) => void;
}

function ActionMenu({
  ticketId,
  currentStatus,
  currentAgente,
  onStatusChange,
  onViewDetail,
  onAssignAgent,
  onResolve,
}: {
  ticketId: string;
  currentStatus: string;
  currentAgente?: string | null;
  onStatusChange: (id: string, status: string) => void;
  onViewDetail: (id: string) => void;
  onAssignAgent: (id: string, agent: string) => void;
  onResolve?: (id: string) => void;
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
    { label: "Pendiente", value: "pendiente", icon: Clock, color: STATUS_ACTION_COLORS.pendiente },
    { label: "En Proceso", value: "en_proceso", icon: Loader, color: STATUS_ACTION_COLORS.en_proceso },
    { label: "Resuelto", value: "resuelto", icon: CheckCircle, color: STATUS_ACTION_COLORS.resuelto },
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
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 bg-transparent cursor-pointer"
      >
        <MoreVertical size={14} color="#9CA3AF" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-gray-900/30 z-50 py-1.5">
          <button
            onClick={() => {
              onViewDetail(ticketId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 font-inter hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent border-none cursor-pointer text-left"
          >
            <Eye size={15} color="#6B7280" />
            Ver detalle
          </button>

          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

          <div className="px-3 pb-1">
            <p className="px-1 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-400 font-inter uppercase tracking-[0.5px]">
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
                className="flex-1 h-[30px] px-2.5 rounded-md border border-gray-200 dark:border-gray-700 text-[12px] text-gray-800 dark:text-gray-100 font-inter outline-none focus:border-[var(--brand)] bg-white dark:bg-gray-900"
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

          {safeStatus !== "resuelto" && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              <div className="px-2 pb-1">
                <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-400 font-inter uppercase tracking-[0.5px]">
                  Cambiar estado
                </p>
                {statusOptions
                  .filter((opt) => opt.value !== safeStatus)
                  .map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (opt.value === "resuelto" && onResolve) {
                          onResolve(ticketId);
                        } else {
                          onStatusChange(ticketId, opt.value);
                        }
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-inter bg-transparent border-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-left ${opt.color}`}
                    >
                      <opt.icon size={13} />
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketTable({ tickets, onStatusChange, onViewDetail, onAssignAgent, onResolve }: TicketTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible">
      <div className="grid grid-cols-[100px_1fr_140px_110px_110px_110px_60px] bg-[#EEF2FF] dark:bg-gray-800 px-5">
        {["ID TICKET", "ASUNTO", "SOLICITANTE", "ESTADO", "CREADO", "CIERRE", "ACCIONES"].map(
          (col) => (
            <div
              key={col}
              className="py-3.5 px-2 text-[11px] font-semibold text-gray-600 dark:text-gray-400 font-inter uppercase tracking-[0.5px]"
            >
              {col}
            </div>
          )
        )}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400 dark:text-gray-400 font-inter">No se encontraron tickets</p>
        </div>
      )}
      {(Array.isArray(tickets) ? tickets : []).map((ticket) => (
        <div
          key={ticket.id}
          className="grid grid-cols-[100px_1fr_140px_110px_110px_110px_60px] px-5 border-t border-gray-100 dark:border-gray-700 items-center min-h-[56px]"
        >
          <div className="py-3 px-2">
            <span className="text-[13px] font-medium text-[var(--brand)] font-inter">
              {formatTicketId(ticket.id)}
            </span>
          </div>

          <div className="py-3 px-2">
            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 font-inter">
              {ticket.asunto}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-400 font-inter mt-0.5">
              {ticket.categoria}
            </p>
          </div>

          <div className="py-3 px-2">
            <span className="text-[13px] text-gray-800 dark:text-gray-100 font-inter font-medium">
              {ticket.solicitante}
            </span>
          </div>

          <div className="py-3 px-2">
            <span
              className={`inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-inter ${STATUS_BADGES[ticket.estado] || "bg-gray-100 text-gray-600"}`}
            >
              {ticket.estado}
            </span>
          </div>

          <div className="py-3 px-2">
            <span className="text-[12px] text-gray-500 dark:text-gray-400 font-inter">
              {ticket.createdAt}
            </span>
          </div>

          <div className="py-3 px-2">
            <span className="text-[12px] text-gray-500 dark:text-gray-400 font-inter">
              {ticket.fechaCierre || "—"}
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
              onResolve={onResolve}
            />
          </div>
        </div>
      ))}
      </div>
  );
}
