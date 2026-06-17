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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-[340px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 font-inter">
          Seleccionar rango de fechas
        </span>
        <button onClick={onCancel} className="bg-none border-none cursor-pointer p-1 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 font-inter mb-1">
            Fecha inicio
          </label>
          <div className="flex items-center h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 gap-2">
            <Calendar size={16} color="#9CA3AF" strokeWidth={1.75} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartChange(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-[13px] font-inter text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 font-inter mb-1">
            Fecha fin
          </label>
          <div className="flex items-center h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 gap-2">
            <Calendar size={16} color="#9CA3AF" strokeWidth={1.75} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndChange(e.target.value)}
              min={startDate || undefined}
              className="flex-1 border-none outline-none bg-transparent text-[13px] font-inter text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="h-9 px-[14px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer text-[13px] font-medium font-inter text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={onApply}
          disabled={!isValid}
          className="h-9 px-[14px] rounded-lg border-none cursor-pointer text-[13px] font-semibold font-inter text-white disabled:cursor-not-allowed"
          style={{
            backgroundColor: isValid ? "#25207E" : "#D1D5DB",
            opacity: isValid ? 1 : 0.6,
          }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
