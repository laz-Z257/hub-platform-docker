"use client";

import { Sun, Moon } from "lucide-react";

interface SettingsAparienciaTabProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export default function SettingsAparienciaTab({ theme, onThemeChange }: SettingsAparienciaTabProps) {
  return (
    <div className="mt-7">
      <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6 max-w-lg">
        <h2 className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6 text-[30px] leading-[1.2]">
          Modo de Visualización
        </h2>
        <p className="text-[14px] text-[#6B7280] dark:text-gray-400 font-inter mb-6">
          Selecciona el tema visual para la plataforma.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => onThemeChange("light")}
            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
              theme === "light"
                ? "border-[var(--brand)] bg-[var(--brand-bg)]"
                : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Sun size={32} color={theme === "light" ? "var(--brand)" : "#6B7280"} />
            <span className={`text-[14px] font-inter ${
              theme === "light" ? "font-semibold text-[var(--brand)]" : "font-medium text-[#6B7280] dark:text-gray-400"
            }`}>
              Claro
            </span>
          </button>
          <button
            onClick={() => onThemeChange("dark")}
            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
              theme === "dark"
                ? "border-[var(--brand)] bg-[var(--brand-bg)]"
                : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Moon size={32} color={theme === "dark" ? "var(--brand)" : "#6B7280"} />
            <span className={`text-[14px] font-inter ${
              theme === "dark" ? "font-semibold text-[var(--brand)]" : "font-medium text-[#6B7280] dark:text-gray-400"
            }`}>
              Oscuro
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
