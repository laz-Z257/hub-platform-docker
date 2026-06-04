"use client";

import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const isValid = startDate && endDate && startDate <= endDate;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "16px",
        width: "340px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#1F2937",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Seleccionar rango de fechas
        </span>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            color: "#9CA3AF",
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Start Date */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "Inter, sans-serif",
              marginBottom: "4px",
            }}
          >
            Fecha inicio
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "40px",
              border: "1px solid #D1D5DB",
              borderRadius: "8px",
              backgroundColor: "#F9FAFB",
              padding: "0 12px",
              gap: "8px",
            }}
          >
            <Calendar size={16} color="#9CA3AF" strokeWidth={1.75} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartChange(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#1F2937",
              }}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "Inter, sans-serif",
              marginBottom: "4px",
            }}
          >
            Fecha fin
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "40px",
              border: "1px solid #D1D5DB",
              borderRadius: "8px",
              backgroundColor: "#F9FAFB",
              padding: "0 12px",
              gap: "8px",
            }}
          >
            <Calendar size={16} color="#9CA3AF" strokeWidth={1.75} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndChange(e.target.value)}
              min={startDate || undefined}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#1F2937",
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            height: "36px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            color: "#6B7280",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onApply}
          disabled={!isValid}
          style={{
            height: "36px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isValid ? "#25207E" : "#D1D5DB",
            cursor: isValid ? "pointer" : "not-allowed",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            color: "#FFFFFF",
            opacity: isValid ? 1 : 0.6,
          }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
