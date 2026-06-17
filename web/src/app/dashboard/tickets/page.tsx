"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TicketSummaryCards from "@/components/TicketSummaryCards";
import TicketFilters from "@/components/TicketFilters";
import TicketTable from "@/components/TicketTable";
import TicketDetailModal from "@/components/TicketDetailModal";
import ResolveTicketModal from "@/components/ResolveTicketModal";
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
  solucion: string | null;
  cerrado_por: string | null;
  fecha_cierre: string | null;
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
  const [dateFilter, setDateFilter] = useState("30d");
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<string | null>(null);
  const [stats, setStats] = useState({ pendientes: 0, enProceso: 0, resueltos: 0 });

  const LIMIT = 10;

  // Mark unread tickets as seen when viewing the page
  useEffect(() => {
    api.patch("/incidents/mark-seen").catch(() => {});
  }, []);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    if (searchTerm) params.set("search", searchTerm);
    if (estadoFilter !== "Todos") params.set("estado", estadoFilter);

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
  }, [page, searchTerm, estadoFilter, dateFilter]);

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
          (Array.isArray(prev) ? prev : []).map((inc) => (inc.id === ticketId ? updated : inc))
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

  const handleResolve = useCallback(
    (ticketId: string) => {
      setResolvingTicket(ticketId);
    },
    []
  );

  const handleResolved = useCallback(
    (ticketId: string) => {
      fetchTickets();
      fetchStats();
    },
    [fetchTickets, fetchStats]
  );

  const handleAssignAgent = useCallback(
    async (ticketId: string, agent: string) => {
      try {
        const updated = await api.patch<IncidentItem>(
          `/incidents/${ticketId}`,
          { agente: agent }
        );
        setIncidents((prev) =>
          (Array.isArray(prev) ? prev : []).map((inc) => (inc.id === ticketId ? updated : inc))
        );
      } catch (err) {
        console.error(
          "Assign agent error:",
          err instanceof Error ? err.message : err
        );
      }
    },
    []
  );

  const handleExport = useCallback(async () => {
    const range = getDateRange(dateFilter);
    const params = new URLSearchParams();
    if (range.start) params.set("start", range.start);
    if (range.end) params.set("end", range.end);
    const qs = params.toString() ? `?${params.toString()}` : "";

    let items: IncidentItem[] = [];
    try {
      const data = await api.get<{ items: IncidentItem[] }>(`/incidents/export${qs}`);
      items = data.items || [];
    } catch {
      return;
    }

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Tickets");

    ws.columns = [
      { header: "Documento", key: "doc", width: 16 },
      { header: "Nombre", key: "nombre", width: 22 },
      { header: "Teléfono", key: "tel", width: 14 },
      { header: "Punto de Venta", key: "pv", width: 22 },
      { header: "Urgencia", key: "urg", width: 12 },
      { header: "Estado", key: "est", width: 14 },
      { header: "Agente", key: "agente", width: 20 },
      { header: "Descripción", key: "desc", width: 50 },
      { header: "Solución", key: "sol", width: 50 },
      { header: "Cerrado por", key: "cerrado_por", width: 22 },
      { header: "Fecha cierre", key: "fecha_cierre", width: 20 },
      { header: "Creado", key: "creado", width: 20 },
      { header: "Actualizado", key: "act", width: 20 },
    ];

    const h = ws.getRow(1);
    h.font = { bold: true, color: { argb: "FFFFFFFF" } };
    h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF25207E" } };

    items.forEach((inc, i) => {
      const row = ws.getRow(2 + i);
      row.getCell(1).value = inc.documento;
      row.getCell(2).value = inc.nombre;
      row.getCell(3).value = inc.telefono;
      row.getCell(4).value = inc.punto_venta;
      row.getCell(5).value = inc.urgencia;
      row.getCell(6).value = inc.estado;
      row.getCell(7).value = inc.agente || "";
      row.getCell(8).value = inc.descripcion;
      row.getCell(9).value = inc.solucion || "";
      row.getCell(10).value = inc.cerrado_por || "";
      row.getCell(11).value = inc.fecha_cierre ? fmtDate(inc.fecha_cierre) : "";
      row.getCell(12).value = fmtDate(inc.created_at);
      row.getCell(13).value = fmtDate(inc.updated_at);
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets_hub${qs ? `_${range.start}_${range.end}` : ""}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dateFilter]);

  const mappedTickets = useMemo(
    () => {
      const safe = Array.isArray(incidents) ? incidents : [];
      return safe.map((inc) => ({
        id: inc.id,
        asunto: formatDescription(inc.descripcion),
        categoria: inc.punto_venta,
        solicitante: inc.nombre,
        estado:
          inc.estado === "pendiente"
            ? "Abierto"
            : inc.estado === "en_proceso"
              ? "En Proceso"
              : "Resuelto",
        updatedAt: getRelativeTime(inc.updated_at),
        agente: inc.agente,
      }));
    },
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
    <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[42px] font-bold text-[#25207E] font-inter leading-tight">
            Gestión de Tickets
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280] dark:text-gray-400 font-inter max-w-[650px]">
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
        dateFilter={dateFilter}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPage(1);
        }}
        onEstadoChange={(v) => {
          setEstadoFilter(v);
          setPage(1);
        }}
        onDateChange={setDateFilter}
        onExport={handleExport}
      />

      {/* Table */}
      <TicketTable tickets={mappedTickets} onStatusChange={handleStatusChange} onViewDetail={handleViewDetail} onAssignAgent={handleAssignAgent} onResolve={handleResolve} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">
          Mostrando {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)}{" "}
          de {total.toLocaleString()} tickets
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white dark:border-gray-700 dark:bg-gray-900"
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
                className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9CA3AF] dark:text-gray-400 font-inter"
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
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white dark:border-gray-700 dark:bg-gray-900"
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

      {resolvingTicket && (
        <ResolveTicketModal
          ticketId={resolvingTicket}
          ticketLabel={(() => {
            const match = mappedTickets.find((t) => t.id === resolvingTicket);
            return match ? `${match.asunto}` : resolvingTicket;
          })()}
          onClose={() => setResolvingTicket(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
}
