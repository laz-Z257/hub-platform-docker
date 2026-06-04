"use client";

import { Download } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import type { AreaDataPoint, DonutDataPoint } from "./AnalyticsCharts";

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

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(s)} – ${fmt(e)}`;
}

async function handleExport(
  metrics: AnalyticsFiltersProps["metrics"],
  areaData: AreaDataPoint[],
  donutData: DonutDataPoint[],
  appliedRange: { start: string; end: string } | null
) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();

  const headerStyle = (fill: string) => ({
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: fill } },
    alignment: { horizontal: "center" as const, vertical: "middle" as const },
    border: {
      top: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      left: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
      right: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
    },
  });

  const cellBorder = {
    border: {
      top: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
      left: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
      right: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
    },
  };

  // Hoja 1: Resumen
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [
    { header: "Métrica", key: "title", width: 28 },
    { header: "Valor", key: "value", width: 18 },
    { header: "Descripción", key: "desc", width: 50 },
  ];

  ws1.mergeCells("A1:C1");
  ws1.getCell("A1").value = "HUB Platform — Reporte de Analítica";
  ws1.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF25207E" } };

  ws1.mergeCells("A2:C2");
  ws1.getCell("A2").value = appliedRange
    ? `Rango: ${formatDateRange(appliedRange.start, appliedRange.end)}`
    : "Últimos 30 días";
  ws1.getCell("A2").font = { size: 11, color: { argb: "FF6B7280" } };

  const headerRow = ws1.getRow(4);
  headerRow.getCell("A").value = "Métrica";
  headerRow.getCell("B").value = "Valor";
  headerRow.getCell("C").value = "Descripción";
  ["A", "B", "C"].forEach((col) => {
    const cell = headerRow.getCell(col);
    Object.assign(cell, headerStyle("FF25207E"));
  });

  metrics.forEach((m, i) => {
    const row = ws1.getRow(5 + i);
    row.getCell("A").value = m.title;
    row.getCell("A").font = { bold: true, size: 11 };
    row.getCell("B").value = m.value;
    row.getCell("B").font = { size: 14, bold: true, color: { argb: "FF25207E" } };
    row.getCell("B").alignment = { horizontal: "center" };
    row.getCell("C").value = m.desc;
    row.getCell("C").font = { size: 10, color: { argb: "FF9CA3AF" } };
    ["A", "B", "C"].forEach((col) => {
      Object.assign(row.getCell(col), cellBorder);
    });
  });

  // Hoja 2: Incidentes
  const ws2 = wb.addWorksheet("Incidentes");
  ws2.columns = [
    { header: "Fecha", key: "fecha", width: 16 },
    { header: "Incidentes", key: "incidentes", width: 14 },
    { header: "Resueltos", key: "resueltos", width: 18 },
  ];
  const h2 = ws2.getRow(1);
  ["A", "B", "C"].forEach((col) => {
    Object.assign(h2.getCell(col), headerStyle("FF25207E"));
  });
  areaData.forEach((d, i) => {
    const row = ws2.getRow(2 + i);
    row.getCell("A").value = d.name;
    row.getCell("B").value = d.trafico;
    row.getCell("B").numFmt = "#,##0";
    row.getCell("C").value = d.conversiones;
    row.getCell("C").numFmt = "#,##0";
    ["A", "B", "C"].forEach((col) => {
      Object.assign(row.getCell(col), cellBorder);
    });
  });
  ws2.autoFilter = { from: "A1", to: `C${areaData.length + 1}` };

  // Hoja 3: Distribución
  const ws3 = wb.addWorksheet("Distribución");
  ws3.columns = [
    { header: "Categoría", key: "cat", width: 28 },
    { header: "Porcentaje", key: "pct", width: 16 },
  ];
  const h3 = ws3.getRow(1);
  ["A", "B"].forEach((col) => {
    Object.assign(h3.getCell(col), headerStyle("FF25207E"));
  });
  donutData.forEach((d, i) => {
    const row = ws3.getRow(2 + i);
    row.getCell("A").value = d.name;
    row.getCell("B").value = `${d.value}%`;
    row.getCell("B").font = { size: 14, bold: true, color: { argb: `FF${d.color.slice(1)}` } };
    row.getCell("B").alignment = { horizontal: "center" };
    ["A", "B"].forEach((col) => {
      Object.assign(row.getCell(col), cellBorder);
    });
  });

  const range = appliedRange
    ? `_${appliedRange.start}_${appliedRange.end}`
    : "";
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analitica_hub${range}.xlsx`;
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
