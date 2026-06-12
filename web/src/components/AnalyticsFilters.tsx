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

  let incidents: IncidentExport[] = [];
  try {
    const qs = appliedRange ? `?start=${appliedRange.start}&end=${appliedRange.end}` : "";
    const incData = await api.get<{ items: IncidentExport[] }>(`/incidents/export${qs}`);
    incidents = incData.items || [];
  } catch { /* ignore */ }

  const totalIncidents = incidents.length;

  // ──────────────────────────────────────
  // HOJA 1: Dashboard
  // ──────────────────────────────────────
  const ws = wb.addWorksheet("Dashboard");
  ws.columns = totalIncidents > 0
    ? [{ width: 30 }, { width: 16 }, { width: 22 }, { width: 16 }, { width: 16 }]
    : [{ width: 30 }, { width: 16 }, { width: 16 }];

  const title = ws.getCell("A1");
  title.value = "HUB Platform — Reporte de Analítica";
  title.font = { bold: true, size: 16, color: { argb: "FF25207E" } };
  ws.mergeCells("A1:E1");

  const sub = ws.getCell("A2");
  sub.value = `${rangeLabel} — Generado: ${generatedAt}`;
  sub.font = { size: 11, color: { argb: "FF6B7280" } };
  ws.mergeCells("A2:E2");

  // ── KPIs ──
  const rowKpiHeader = 4;
  const kpiLabels = ["Métrica", "Valor", "Descripción"];
  kpiLabels.forEach((l, i) => {
    const cell = ws.getCell(rowKpiHeader, i + 1);
    cell.value = l;
    Object.assign(cell, headerStyle("FF25207E"));
  });

  const allMetrics = [
    ...metrics,
    { title: "Alta Urgencia", value: incidents.filter((i) => i.urgencia === "alta").length.toLocaleString(), desc: "Incidentes con prioridad alta" },
    { title: "Agentes Activos", value: [...new Set(incidents.filter((i) => i.agente).map((i) => i.agente))].length.toLocaleString(), desc: "Técnicos con incidentes asignados" },
  ];
  allMetrics.forEach((m, i) => {
    const r = ws.getRow(rowKpiHeader + 1 + i);
    r.getCell(1).value = m.title;
    r.getCell(1).font = { bold: true, size: 11 };
    r.getCell(2).value = m.value;
    r.getCell(2).font = { size: 14, bold: true, color: { argb: "FF25207E" } };
    r.getCell(2).alignment = { horizontal: "center" };
    r.getCell(3).value = m.desc;
    r.getCell(3).font = { size: 10, color: { argb: "FF9CA3AF" } };
    [1, 2, 3].forEach((c) => Object.assign(r.getCell(c), cellBorder));
  });

  // ── Urgencia table ──
  const urgRow = rowKpiHeader + allMetrics.length + 2;
  const urgTitle = ws.getCell(urgRow, 1);
  urgTitle.value = "Distribución por Urgencia";
  urgTitle.font = { bold: true, size: 13, color: { argb: "FF25207E" } };
  ws.mergeCells(urgRow, 1, urgRow, 3);

  const urgHeader = ws.getRow(urgRow + 1);
  ["Urgencia", "Cantidad", "%"].forEach((l, i) => {
    const cell = urgHeader.getCell(i + 1);
    cell.value = l;
    Object.assign(cell, headerStyle("FF25207E"));
  });

  const urgenciaMap = { alta: 0, media: 0, baja: 0 };
  for (const inc of incidents) {
    if (inc.urgencia === "alta") urgenciaMap.alta++;
    else if (inc.urgencia === "media") urgenciaMap.media++;
    else urgenciaMap.baja++;
  }
  const tot = totalIncidents || 1;
  const urgColors: Record<string, string> = { alta: "FFEF4444", media: "FFF59E0B", baja: "FF22C55E" };
  ["alta", "media", "baja"].forEach((key, i) => {
    const r = ws.getRow(urgRow + 2 + i);
    r.getCell(1).value = key.charAt(0).toUpperCase() + key.slice(1);
    r.getCell(1).font = { bold: true, size: 11, color: { argb: urgColors[key] } };
    r.getCell(2).value = urgenciaMap[key as keyof typeof urgenciaMap];
    r.getCell(2).numFmt = "#,##0";
    r.getCell(3).value = `${Math.round((urgenciaMap[key as keyof typeof urgenciaMap] / tot) * 100)}%`;
    [1, 2, 3].forEach((c) => Object.assign(r.getCell(c), cellBorder));
  });

  // ── Status table ──
  const stRow = urgRow + 6;
  const stTitle = ws.getCell(stRow, 1);
  stTitle.value = "Incidentes por Estado";
  stTitle.font = { bold: true, size: 13, color: { argb: "FF25207E" } };
  ws.mergeCells(stRow, 1, stRow, 3);

  const stHeader = ws.getRow(stRow + 1);
  ["Estado", "Cantidad", "%"].forEach((l, i) => {
    const cell = stHeader.getCell(i + 1);
    cell.value = l;
    Object.assign(cell, headerStyle("FF25207E"));
  });

  const estadoMap = { pendiente: 0, en_proceso: 0, resuelto: 0 };
  for (const inc of incidents) {
    if (inc.estado === "pendiente") estadoMap.pendiente++;
    else if (inc.estado === "en_proceso") estadoMap.en_proceso++;
    else if (inc.estado === "resuelto") estadoMap.resuelto++;
  }
  const estadoColors: Record<string, string> = { pendiente: "FF3B82F6", en_proceso: "FF7C3AED", resuelto: "FF22C55E" };
  const estadoLabels: Record<string, string> = { pendiente: "Pendiente", en_proceso: "En Proceso", resuelto: "Resuelto" };
  ["pendiente", "en_proceso", "resuelto"].forEach((key, i) => {
    const r = ws.getRow(stRow + 2 + i);
    r.getCell(1).value = estadoLabels[key];
    r.getCell(1).font = { bold: true, size: 11, color: { argb: estadoColors[key] } };
    r.getCell(2).value = estadoMap[key as keyof typeof estadoMap];
    r.getCell(2).numFmt = "#,##0";
    r.getCell(3).value = totalIncidents > 0 ? `${Math.round((estadoMap[key as keyof typeof estadoMap] / totalIncidents) * 100)}%` : "0%";
    [1, 2, 3].forEach((c) => Object.assign(r.getCell(c), cellBorder));
  });

  // ── Agentes table ──
  const agRow = stRow + 6;
  const agTitle = ws.getCell(agRow, 1);
  agTitle.value = "Resumen por Agente";
  agTitle.font = { bold: true, size: 13, color: { argb: "FF25207E" } };
  ws.mergeCells(agRow, 1, agRow, 5);

  const agHeader = ws.getRow(agRow + 1);
  ["Agente", "Pendientes", "En Proceso", "Resueltos", "Total"].forEach((l, i) => {
    const cell = agHeader.getCell(i + 1);
    cell.value = l;
    Object.assign(cell, headerStyle("FF25207E"));
  });

  const agMap = new Map<string, { p: number; ep: number; r: number }>();
  for (const inc of incidents) {
    const ag = inc.agente || "Sin asignar";
    const e = agMap.get(ag) || { p: 0, ep: 0, r: 0 };
    if (inc.estado === "pendiente") e.p++;
    else if (inc.estado === "en_proceso") e.ep++;
    else if (inc.estado === "resuelto") e.r++;
    agMap.set(ag, e);
  }
  const agRows = Array.from(agMap.entries()).map(([ag, c]) => ({ ag, ...c, total: c.p + c.ep + c.r }));
  agRows.forEach((r, i) => {
    const row = ws.getRow(agRow + 2 + i);
    row.getCell(1).value = r.ag;
    row.getCell(2).value = r.p;
    row.getCell(3).value = r.ep;
    row.getCell(4).value = r.r;
    row.getCell(5).value = r.total;
    [1, 2, 3, 4, 5].forEach((c) => Object.assign(row.getCell(c), cellBorder));
  });

  // ──────────────────────────────────────
  // HOJA 2: Timeline
  // ──────────────────────────────────────
  const ws2 = wb.addWorksheet("Timeline");
  ws2.columns = [
    { header: "Fecha", key: "fecha", width: 16 },
    { header: "Creados", key: "creados", width: 12 },
    { header: "Resueltos", key: "resueltos", width: 12 },
    { header: "Abiertos Netos", key: "netos", width: 16 },
    { header: "Acumulado", key: "acum", width: 14 },
  ];
  const h2 = ws2.getRow(1);
  ["A", "B", "C", "D", "E"].forEach((col) => Object.assign(h2.getCell(col), headerStyle("FF25207E")));

  let runningTotal = 0;
  let sumCreated = 0;
  let sumResolved = 0;
  areaData.forEach((d, i) => {
    const netos = d.trafico - d.conversiones;
    runningTotal += netos;
    sumCreated += d.trafico;
    sumResolved += d.conversiones;
    const row = ws2.getRow(2 + i);
    row.getCell("A").value = d.name;
    row.getCell("B").value = d.trafico;
    row.getCell("B").numFmt = "#,##0";
    row.getCell("C").value = d.conversiones;
    row.getCell("C").numFmt = "#,##0";
    row.getCell("D").value = netos;
    row.getCell("D").numFmt = "#,##0";
    row.getCell("D").font = { color: { argb: netos > 0 ? "FFEF4444" : netos < 0 ? "FF22C55E" : "FF6B7280" } };
    row.getCell("E").value = runningTotal;
    row.getCell("E").numFmt = "#,##0";
    row.getCell("E").font = { bold: true, color: { argb: runningTotal > 0 ? "FF25207E" : "FF6B7280" } };
    ["A", "B", "C", "D", "E"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });

  // Summary row
  const sumRow = ws2.getRow(areaData.length + 2);
  sumRow.getCell("A").value = "TOTAL";
  sumRow.getCell("A").font = { bold: true, size: 12, color: { argb: "FF25207E" } };
  sumRow.getCell("B").value = sumCreated;
  sumRow.getCell("B").font = { bold: true, size: 12 };
  sumRow.getCell("B").numFmt = "#,##0";
  sumRow.getCell("C").value = sumResolved;
  sumRow.getCell("C").font = { bold: true, size: 12 };
  sumRow.getCell("C").numFmt = "#,##0";
  sumRow.getCell("D").value = sumCreated - sumResolved;
  sumRow.getCell("D").font = { bold: true, size: 12 };
  sumRow.getCell("D").numFmt = "#,##0";
  sumRow.getCell("E").value = runningTotal;
  sumRow.getCell("E").font = { bold: true, size: 12, color: { argb: "FF25207E" } };
  sumRow.getCell("E").numFmt = "#,##0";
  ["A", "B", "C", "D", "E"].forEach((col) => Object.assign(sumRow.getCell(col), cellBorder));

  ws2.autoFilter = { from: "A1", to: `E${areaData.length + 1}` };

  // ──────────────────────────────────────
  // HOJA 3: Detalle
  // ──────────────────────────────────────
  const ws3 = wb.addWorksheet("Detalle");
  ws3.columns = [
    { header: "Documento", key: "doc", width: 16 },
    { header: "Nombre", key: "nombre", width: 22 },
    { header: "Punto de Venta", key: "pv", width: 22 },
    { header: "Urgencia", key: "urg", width: 12 },
    { header: "Estado", key: "est", width: 14 },
    { header: "Agente", key: "agente", width: 20 },
    { header: "Descripción", key: "desc", width: 50 },
    { header: "Creado", key: "creado", width: 18 },
  ];
  const h3 = ws3.getRow(1);
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => Object.assign(h3.getCell(col), headerStyle("FF25207E")));
  incidents.forEach((inc, i) => {
    const row = ws3.getRow(2 + i);
    row.getCell("A").value = inc.documento;
    row.getCell("B").value = inc.nombre;
    row.getCell("C").value = inc.punto_venta;
    row.getCell("D").value = inc.urgencia;
    row.getCell("E").value = inc.estado;
    row.getCell("F").value = inc.agente || "";
    row.getCell("G").value = inc.descripcion;
    row.getCell("H").value = fmtDateTime(inc.created_at);
    ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => Object.assign(row.getCell(col), cellBorder));
  });
  ws3.autoFilter = { from: "A1", to: `H${incidents.length + 1}` };

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
