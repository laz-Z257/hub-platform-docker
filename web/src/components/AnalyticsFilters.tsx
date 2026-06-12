"use client";

import { Download } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import type { AreaDataPoint, DonutDataPoint } from "./AnalyticsCharts";
import { api } from "@/lib/api";

interface IncidentExport {
  id: string;
  user_id: string;
  nombre: string;
  documento: string;
  punto_venta: string;
  telefono: string;
  descripcion: string;
  urgencia: string;
  estado: string;
  agente: string | null;
  created_at: string;
  updated_at: string;
  comments?: {
    id: string;
    incident_id: string;
    autor: string;
    texto: string;
    fecha: string;
  }[];
}

interface UserExport {
  id: string;
  documento: string;
  nombre: string;
  email: string | null;
  rol: string;
  estado: string;
  ultima_actividad: string | null;
  created_at: string;
}

interface AnalyticsFiltersProps {
  filter: "30d" | "custom";
  showDatePicker: boolean;
  startDate: string;
  endDate: string;
  appliedRange: { start: string; end: string } | null;
  metrics: { title: string; value: string; desc: string }[];
  areaData: AreaDataPoint[];
  donutData: DonutDataPoint[];
  onFilterChange: (filter: "30d" | "custom") => void;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onApplyRange: () => void;
  onCancelRange: () => void;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateRange(start: string, end: string): string {
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

function headerStyle(fill: string) {
  return {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: fill } },
    alignment: { horizontal: "center" as const, vertical: "middle" as const },
    border: {
      top: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      left: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      right: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
    },
  };
}

const cellBorder = {
  border: {
    top: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
    left: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
    right: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
  },
};

async function handleExport(
  metrics: AnalyticsFiltersProps["metrics"],
  areaData: AreaDataPoint[],
  donutData: DonutDataPoint[],
  appliedRange: { start: string; end: string } | null
) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();

  const baseDate = new Date();
  const generatedAt = baseDate.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const rangeLabel = appliedRange ? `Rango: ${formatDateRange(appliedRange.start, appliedRange.end)}` : "Últimos 30 días";
  const rangeSuffix = appliedRange ? `_${appliedRange.start}_${appliedRange.end}` : "";

  // ── Fetch data ──
  let incidents: IncidentExport[] = [];
  let users: UserExport[] = [];
  try {
    const qs = appliedRange ? `?start=${appliedRange.start}&end=${appliedRange.end}` : "";
    const incData = await api.get<{ items: IncidentExport[] }>(`/incidents/export${qs}`);
    incidents = incData.items || [];
  } catch { /* ignore */ }
  try {
    const userData = await api.get<{ items: UserExport[] }>("/users?limit=200");
    users = userData.items || [];
  } catch { /* ignore */ }

  const totalIncidents = incidents.length;

  // ── Hoja 1: Resumen ──
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [
    { header: "Métrica", key: "title", width: 30 },
    { header: "Valor", key: "value", width: 18 },
    { header: "Descripción", key: "desc", width: 55 },
  ];

  ws1.mergeCells("A1:C1");
  ws1.getCell("A1").value = "HUB Platform — Reporte de Analítica";
  ws1.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF25207E" } };

  ws1.mergeCells("A2:C2");
  ws1.getCell("A2").value = `${rangeLabel} — Generado: ${generatedAt}`;
  ws1.getCell("A2").font = { size: 11, color: { argb: "FF6B7280" } };

  const hr1 = ws1.getRow(4);
  hr1.getCell("A").value = "Métrica";
  hr1.getCell("B").value = "Valor";
  hr1.getCell("C").value = "Descripción";
  ["A", "B", "C"].forEach((col) => Object.assign(hr1.getCell(col), headerStyle("FF25207E")));

  const allMetrics = [
    ...metrics,
    { title: "Alta Urgencia", value: incidents.filter((i) => i.urgencia === "alta").length.toLocaleString(), desc: "Incidentes con prioridad alta" },
    { title: "Usuarios Registrados", value: users.length.toLocaleString(), desc: "Total de usuarios en la plataforma" },
    { title: "Agentes Activos", value: [...new Set(incidents.filter((i) => i.agente).map((i) => i.agente))].length.toLocaleString(), desc: "Técnicos con incidentes asignados" },
  ];
  allMetrics.forEach((m, i) => {
    const row = ws1.getRow(5 + i);
    row.getCell("A").value = m.title;
    row.getCell("A").font = { bold: true, size: 11 };
    row.getCell("B").value = m.value;
    row.getCell("B").font = { size: 14, bold: true, color: { argb: "FF25207E" } };
    row.getCell("B").alignment = { horizontal: "center" };
    row.getCell("C").value = m.desc;
    row.getCell("C").font = { size: 10, color: { argb: "FF9CA3AF" } };
    ["A", "B", "C"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });

  // ── Hoja 2: Incidentes por Día ──
  const ws2 = wb.addWorksheet("Incidentes por Día");
  ws2.columns = [
    { header: "Fecha", key: "fecha", width: 16 },
    { header: "Creados", key: "creados", width: 14 },
    { header: "Resueltos", key: "resueltos", width: 14 },
  ];
  const h2 = ws2.getRow(1);
  ["A", "B", "C"].forEach((col) => Object.assign(h2.getCell(col), headerStyle("FF25207E")));
  areaData.forEach((d, i) => {
    const row = ws2.getRow(2 + i);
    row.getCell("A").value = d.name;
    row.getCell("B").value = d.trafico;
    row.getCell("B").numFmt = "#,##0";
    row.getCell("C").value = d.conversiones;
    row.getCell("C").numFmt = "#,##0";
    ["A", "B", "C"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws2.autoFilter = { from: "A1", to: `C${areaData.length + 1}` };

  // ── Hoja 3: Distribución por Urgencia ──
  const ws3 = wb.addWorksheet("Distribución por Urgencia");
  ws3.columns = [
    { header: "Categoría", key: "cat", width: 28 },
    { header: "Porcentaje", key: "pct", width: 16 },
    { header: "Cantidad", key: "qty", width: 14 },
  ];
  const h3 = ws3.getRow(1);
  ["A", "B", "C"].forEach((col) => Object.assign(h3.getCell(col), headerStyle("FF25207E")));
  const urgenciaCounts = { alta: incidents.filter((i) => i.urgencia === "alta").length, media: incidents.filter((i) => i.urgencia === "media").length, baja: incidents.filter((i) => i.urgencia === "baja").length };
  const urgenciaTot = totalIncidents || 1;
  [
    { name: "Alta", count: urgenciaCounts.alta, color: "#EF4444" },
    { name: "Media", count: urgenciaCounts.media, color: "#F59E0B" },
    { name: "Baja", count: urgenciaCounts.baja, color: "#22C55E" },
  ].forEach((item, i) => {
    const row = ws3.getRow(2 + i);
    row.getCell("A").value = item.name;
    row.getCell("B").value = `${Math.round((item.count / urgenciaTot) * 100)}%`;
    row.getCell("C").value = item.count;
    row.getCell("C").numFmt = "#,##0";
    row.getCell("A").font = { bold: true, size: 11, color: { argb: item.color.slice(1) } };
    ["A", "B", "C"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });

  // ── Hoja 4: Detalle de Incidentes ──
  const ws4 = wb.addWorksheet("Detalle de Incidentes");
  ws4.columns = [
    { header: "ID", key: "id", width: 36 },
    { header: "Documento", key: "doc", width: 16 },
    { header: "Nombre", key: "nombre", width: 22 },
    { header: "Punto de Venta", key: "pv", width: 22 },
    { header: "Teléfono", key: "tel", width: 16 },
    { header: "Urgencia", key: "urg", width: 12 },
    { header: "Estado", key: "est", width: 14 },
    { header: "Agente", key: "agente", width: 20 },
    { header: "Descripción", key: "desc", width: 50 },
    { header: "Creado", key: "creado", width: 18 },
    { header: "Actualizado", key: "act", width: 18 },
  ];
  const h4 = ws4.getRow(1);
  ws4.columns.forEach((_, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    Object.assign(h4.getCell(colLetter), headerStyle("FF25207E"));
  });
  incidents.forEach((inc, i) => {
    const row = ws4.getRow(2 + i);
    row.getCell("A").value = inc.id;
    row.getCell("B").value = inc.documento;
    row.getCell("C").value = inc.nombre;
    row.getCell("D").value = inc.punto_venta;
    row.getCell("E").value = inc.telefono;
    row.getCell("F").value = inc.urgencia;
    row.getCell("G").value = inc.estado;
    row.getCell("H").value = inc.agente || "";
    row.getCell("I").value = inc.descripcion;
    row.getCell("J").value = fmtDateTime(inc.created_at);
    row.getCell("K").value = fmtDateTime(inc.updated_at);
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws4.autoFilter = { from: "A1", to: `K${incidents.length + 1}` };

  // ── Hoja 5: Comentarios ──
  const allComments = incidents.flatMap((inc) =>
    (inc.comments || []).map((c) => ({ ...c, incident_documento: inc.documento, incident_nombre: inc.nombre }))
  );
  const ws5 = wb.addWorksheet("Comentarios");
  ws5.columns = [
    { header: "ID Incidente", key: "incId", width: 36 },
    { header: "Documento", key: "doc", width: 16 },
    { header: "Nombre", key: "nombre", width: 22 },
    { header: "Autor", key: "autor", width: 22 },
    { header: "Comentario", key: "texto", width: 60 },
    { header: "Fecha", key: "fecha", width: 18 },
  ];
  const h5 = ws5.getRow(1);
  ["A", "B", "C", "D", "E", "F"].forEach((col) => Object.assign(h5.getCell(col), headerStyle("FF25207E")));
  allComments.forEach((c, i) => {
    const row = ws5.getRow(2 + i);
    row.getCell("A").value = c.incident_id;
    row.getCell("B").value = c.incident_documento;
    row.getCell("C").value = c.incident_nombre;
    row.getCell("D").value = c.autor;
    row.getCell("E").value = c.texto;
    row.getCell("F").value = fmtDateTime(c.fecha);
    ["A", "B", "C", "D", "E", "F"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws5.autoFilter = { from: "A1", to: `F${allComments.length + 1}` };

  // ── Hoja 6: Usuarios ──
  const ws6 = wb.addWorksheet("Usuarios");
  ws6.columns = [
    { header: "Documento", key: "doc", width: 16 },
    { header: "Nombre", key: "nombre", width: 22 },
    { header: "Email", key: "email", width: 30 },
    { header: "Rol", key: "rol", width: 12 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Última Actividad", key: "act", width: 20 },
    { header: "Creado", key: "creado", width: 18 },
  ];
  const h6 = ws6.getRow(1);
  ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => Object.assign(h6.getCell(col), headerStyle("FF25207E")));
  users.forEach((u, i) => {
    const row = ws6.getRow(2 + i);
    row.getCell("A").value = u.documento;
    row.getCell("B").value = u.nombre;
    row.getCell("C").value = u.email || "";
    row.getCell("D").value = u.rol;
    row.getCell("E").value = u.estado;
    row.getCell("F").value = u.ultima_actividad ? fmtDateTime(u.ultima_actividad) : "Sin actividad";
    row.getCell("G").value = fmtDate(u.created_at);
    ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws6.autoFilter = { from: "A1", to: `G${users.length + 1}` };

  // ── Hoja 7: Resumen por Agente ──
  const agenteMap = new Map<string, { pendientes: number; enProceso: number; resueltos: number }>();
  for (const inc of incidents) {
    const agente = inc.agente || "Sin asignar";
    const entry = agenteMap.get(agente) || { pendientes: 0, enProceso: 0, resueltos: 0 };
    if (inc.estado === "pendiente") entry.pendientes++;
    else if (inc.estado === "en_proceso") entry.enProceso++;
    else if (inc.estado === "resuelto") entry.resueltos++;
    agenteMap.set(agente, entry);
  }
  const agenteRows = Array.from(agenteMap.entries()).map(([agente, counts]) => ({
    agente,
    ...counts,
    total: counts.pendientes + counts.enProceso + counts.resueltos,
  }));

  const ws7 = wb.addWorksheet("Resumen por Agente");
  ws7.columns = [
    { header: "Agente", key: "agente", width: 24 },
    { header: "Pendientes", key: "pendientes", width: 14 },
    { header: "En Proceso", key: "enProceso", width: 14 },
    { header: "Resueltos", key: "resueltos", width: 14 },
    { header: "Total", key: "total", width: 12 },
  ];
  const h7 = ws7.getRow(1);
  ["A", "B", "C", "D", "E"].forEach((col) => Object.assign(h7.getCell(col), headerStyle("FF25207E")));
  agenteRows.forEach((r, i) => {
    const row = ws7.getRow(2 + i);
    row.getCell("A").value = r.agente;
    row.getCell("B").value = r.pendientes;
    row.getCell("C").value = r.enProceso;
    row.getCell("D").value = r.resueltos;
    row.getCell("E").value = r.total;
    ["A", "B", "C", "D", "E"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws7.autoFilter = { from: "A1", to: `E${agenteRows.length + 1}` };

  // ── Guardar ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analitica_hub${rangeSuffix}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsFilters(props: AnalyticsFiltersProps) {
  const {
    filter,
    showDatePicker,
    startDate,
    endDate,
    metrics,
    areaData,
    donutData,
    appliedRange,
    onFilterChange,
    onStartChange,
    onEndChange,
    onApplyRange,
    onCancelRange,
  } = props;

  return (
    <div className="relative">
      <div className="flex gap-3 items-center">
        <div className="flex items-center w-[220px] h-11 bg-[#E9E6FF] rounded-xl p-[3px]">
          <button
            onClick={() => onFilterChange("30d")}
            className="flex-1 h-[38px] rounded-[10px] border-none cursor-pointer font-inter text-[13px] font-semibold transition-all duration-150"
            style={{
              color: filter === "30d" ? "#25207E" : "#6B7280",
              backgroundColor: filter === "30d" ? "#FFFFFF" : "transparent",
              boxShadow: filter === "30d" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Últimos 30 Días
          </button>
          <button
            onClick={() => onFilterChange("custom")}
            className="flex-1 h-[38px] rounded-[10px] border-none cursor-pointer font-inter text-[13px] font-semibold transition-all duration-150"
            style={{
              color: filter === "custom" ? "#25207E" : "#6B7280",
              backgroundColor: filter === "custom" ? "#FFFFFF" : "transparent",
              boxShadow: filter === "custom" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Rango Personalizado
          </button>
        </div>

        <button
          onClick={() => handleExport(metrics, areaData, donutData, appliedRange)}
          className="flex items-center gap-2 h-11 px-[18px] bg-[#25207E] border-none rounded-[10px] cursor-pointer font-inter text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(37,32,126,0.2)]"
        >
          <Download size={16} strokeWidth={2.5} />
          Exportar Datos
        </button>
      </div>

      {showDatePicker && (
        <div className="absolute top-14 right-0 z-50">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={onStartChange}
            onEndChange={onEndChange}
            onApply={onApplyRange}
            onCancel={onCancelRange}
          />
        </div>
      )}
    </div>
  );
}
