"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TicketSummaryCards from "@/components/TicketSummaryCards";
import TicketFilters from "@/components/TicketFilters";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import { api } from "@/lib/api";

interface IncidentItem {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  descripcion: string;
  punto_venta: string;
  urgencia: string;
  estado: string;
  agente: string | null;
  created_at: string;
  updated_at: string;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) {
    const d = new Date(dateStr);
    return `Hoy, ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const d = new Date(dateStr);
  return `Ayer, ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDescription(desc: string): string {
  return desc.length > 50 ? desc.slice(0, 50) + "..." : desc;
}

function getDateRange(filter: string): { start?: string; end?: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  switch (filter) {
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { start: d.toISOString().split("T")[0], end };
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { start: d.toISOString().split("T")[0], end };
    }
    case "90d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      return { start: d.toISOString().split("T")[0], end };
    }
    default:
      return {};
  }
}

export default function TicketsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [prioridadFilter, setPrioridadFilter] = useState("Todas");
  const [dateFilter, setDateFilter] = useState("30d");
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [stats, setStats] = useState({ pendientes: 0, enProceso: 0, resueltos: 0 });

  const LIMIT = 10;

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    if (searchTerm) params.set("search", searchTerm);
    if (estadoFilter !== "Todos") params.set("estado", estadoFilter);
    if (prioridadFilter !== "Todas") params.set("urgencia", prioridadFilter);

    const range = getDateRange(dateFilter);
    if (range.start) params.set("start", range.start);
    if (range.end) params.set("end", range.end);

    api
      .get<{ items: IncidentItem[]; total: number }>(
        `/incidents?${params.toString()}`
      )
      .then((data) => {
        setIncidents(data.items);
        setTotal(data.total);
      })
      .catch((err) =>
        console.error("Tickets:", err instanceof Error ? err.message : err)
      )
      .finally(() => setLoading(false));
  }, [page, searchTerm, estadoFilter, prioridadFilter, dateFilter]);

  const fetchStats = useCallback(() => {
    const range = getDateRange(dateFilter);
    const params = new URLSearchParams();
    if (range.start) params.set("start", range.start);
    if (range.end) params.set("end", range.end);

    api
      .get<{ pendientes: number; enProceso: number; resueltos: number }>(
        `/dashboard/kpis?${params.toString()}`
      )
      .then((data) => {
        setStats({
          pendientes: data.pendientes,
          enProceso: data.enProceso,
          resueltos: data.resueltos,
        });
      })
      .catch((err) =>
        console.error("Stats:", err instanceof Error ? err.message : err)
      );
  }, [dateFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusChange = useCallback(
    async (ticketId: string, newStatus: string) => {
      try {
        const updated = await api.patch<IncidentItem>(
          `/incidents/${ticketId}`,
          { estado: newStatus }
        );
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === ticketId ? updated : inc))
        );
      } catch (err) {
        console.error(
          "Status change error:",
          err instanceof Error ? err.message : err
        );
      }
    },
    []
  );

  const handleViewDetail = useCallback(
    async (ticketId: string) => {
      try {
        const incident = await api.get<IncidentItem>(
          `/incidents/${ticketId}`
        );
        setSelectedIncident(incident);
      } catch (err) {
        console.error(
          "Detail error:",
          err instanceof Error ? err.message : err
        );
      }
    },
    []
  );

  const mappedTickets = useMemo(
    () =>
      incidents.map((inc) => ({
        id: inc.id,
        asunto: formatDescription(inc.descripcion),
        categoria: inc.punto_venta,
        solicitante: inc.nombre,
        prioridad: inc.urgencia === "alta" ? "ALTA" : inc.urgencia === "media" ? "MEDIA" : "BAJA",
        estado:
          inc.estado === "pendiente"
            ? "Abierto"
            : inc.estado === "en_proceso"
              ? "En Proceso"
              : "Resuelto",
        updatedAt: getRelativeTime(inc.updated_at),
      })),
    [incidents]
  );

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="bg-[#F7F8FC] min-h-[calc(100vh-72px)] p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[42px] font-bold text-[#25207E] font-inter leading-tight">
            Gestión de Tickets
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280] font-inter max-w-[650px]">
            Administre las solicitudes de soporte, supervise el progreso del
            equipo y mantenga altos estándares de resolución para sus clientes
            externos e internos.
          </p>
        </div>

        <button className="flex items-center gap-2 h-11 px-[18px] bg-[#25207E] border-none rounded-[10px] cursor-pointer font-inter text-[13px] font-semibold text-white">
          <PlusCircle size={18} strokeWidth={2} />
          Abrir Nuevo Ticket
        </button>
      </div>

      {/* Summary Cards */}
      <TicketSummaryCards
        total={total}
        pendientes={stats.pendientes}
        enProceso={stats.enProceso}
        resueltos={stats.resueltos}
        loading={loading}
      />

      {/* Filter Bar */}
      <TicketFilters
        searchTerm={searchTerm}
        estadoFilter={estadoFilter}
        prioridadFilter={prioridadFilter}
        dateFilter={dateFilter}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPage(1);
        }}
        onEstadoChange={(v) => {
          setEstadoFilter(v);
          setPage(1);
        }}
        onPrioridadChange={(v) => {
          setPrioridadFilter(v);
          setPage(1);
        }}
        onDateChange={setDateFilter}
      />

      {/* Table */}
      <TicketTable tickets={mappedTickets} onStatusChange={handleStatusChange} onViewDetail={handleViewDetail} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <span className="text-[13px] text-[#6B7280] font-inter">
          Mostrando {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)}{" "}
          de {total.toLocaleString()} tickets
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white"
            style={{
              cursor: page === 1 ? "default" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={14} color="#6B7280" strokeWidth={2} />
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`dot-${i}`}
                className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9CA3AF] font-inter"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-inter cursor-pointer"
                style={{
                  border: page === p ? "none" : "1px solid #E5E7EB",
                  backgroundColor: page === p ? "#25207E" : "#FFFFFF",
                  color: page === p ? "#FFFFFF" : "#374151",
                  fontWeight: page === p ? 600 : 400,
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white"
            style={{
              cursor: page === totalPages ? "default" : "pointer",
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight size={14} color="#6B7280" strokeWidth={2} />
          </button>
        </div>
      </div>
      {selectedIncident && (
        <TicketDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
