"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, X, Sun, Moon } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useTheme } from "@/contexts/ThemeContext";

const TABS = [
  { label: "Perfil de la Empresa", key: "empresa" },
  { label: "Apariencia", key: "apariencia" },
  { label: "Seguridad", key: "seguridad" },
  { label: "Notificaciones", key: "notificaciones" },
] as const;

function SettingsTabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="border-b border-[#E5E7EB] dark:border-gray-700">
      <div className="flex gap-0">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`relative px-5 py-3 text-[13px] font-inter transition-colors duration-150 ${
                isActive
                  ? "font-semibold text-[#25207E]"
                  : "font-normal text-[#6B7280] dark:text-gray-400"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#25207E]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("empresa");
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-full bg-[#F7F8FC] dark:bg-gray-950 px-8 py-7">
      {/* Header */}
      <div className="mb-7">
        <h1
          className="font-inter font-bold text-[#25207E] leading-tight"
          style={{ fontSize: "42px", lineHeight: 1.1 }}
        >
          Configuración del Sistema
        </h1>
        <p className="text-[14px] text-[#6B7280] dark:text-gray-400 font-inter mt-2 max-w-[640px]">
          Administra la identidad de tu empresa, la seguridad y las preferencias
          globales de la plataforma.
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab Content - Empresa */}
      {activeTab === "empresa" && (
        <div className="flex gap-6 mt-7">
          {/* Left column */}
          <div className="flex-[7]">
            {/* General Information Card */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h2
                className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6"
                style={{ fontSize: "30px", lineHeight: 1.2 }}
              >
                Información General
              </h2>

              {/* Row 1 */}
              <div className="flex gap-5 mb-5">
                <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#374151] dark:text-gray-300 font-inter mb-1.5">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue="XXXXXXXXXXXX"
                    className="w-full h-[42px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 text-[14px] text-[#1F2937] dark:text-gray-100 font-inter outline-none focus:border-[#25207E] transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-medium text-[#374151] dark:text-gray-300 font-inter mb-1.5">
                    ID de Contribuyente
                  </label>
                  <input
                    type="text"
                    defaultValue="XXXXXXXXXXXX"
                    className="w-full h-[42px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 text-[14px] text-[#1F2937] dark:text-gray-100 font-inter outline-none focus:border-[#25207E] transition-colors"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[14px] font-medium text-[#374151] dark:text-gray-300 font-inter mb-1.5">
                  Dirección Fiscal
                </label>
                <textarea
                  defaultValue="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  rows={3}
                  className="w-full h-[80px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 py-2 text-[14px] text-[#1F2937] dark:text-gray-100 font-inter outline-none focus:border-[#25207E] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-[3]">
            {/* Logo Card */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6 flex flex-col items-center">
              <h2
                className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6 self-start"
                style={{ fontSize: "30px", lineHeight: 1.2 }}
              >
                Logo Corporativo
              </h2>
              <div className="w-[140px] h-[140px] bg-[#F8FAFC] dark:bg-gray-800 border-2 border-dashed border-[#CBD5E1] dark:border-gray-600 rounded-full flex items-center justify-center">
                <Image
                  src={logoImg}
                  alt="Company Logo"
                  width={80}
                  height={80}
                  style={{ borderRadius: "6px", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Apariencia */}
      {activeTab === "apariencia" && (
        <div className="mt-7">
          <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6 max-w-lg">
            <h2
              className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6"
              style={{ fontSize: "30px", lineHeight: 1.2 }}
            >
              Modo de Visualización
            </h2>
            <p className="text-[14px] text-[#6B7280] dark:text-gray-400 font-inter mb-6">
              Selecciona el tema visual para la plataforma.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                  theme === "light"
                    ? "border-[#25207E] bg-[#F3F0FF]"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Sun size={32} color={theme === "light" ? "#25207E" : "#6B7280"} />
                <span className={`text-[14px] font-inter ${
                  theme === "light" ? "font-semibold text-[#25207E]" : "font-medium text-[#6B7280]"
                }`}>
                  Claro
                </span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                  theme === "dark"
                    ? "border-[#25207E] bg-[#F3F0FF]"
                    : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Moon size={32} color={theme === "dark" ? "#25207E" : "#6B7280"} />
                <span className={`text-[14px] font-inter ${
                  theme === "dark" ? "font-semibold text-[#25207E]" : "font-medium text-[#6B7280]"
                }`}>
                  Oscuro
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(activeTab === "empresa" || activeTab === "apariencia") && (
        <div className="flex justify-end gap-3 mt-6">
          <button className="h-[44px] px-5 bg-white dark:bg-gray-900 border border-[#D1D5DB] dark:border-gray-600 rounded-lg text-[14px] font-medium text-[#4B5563] dark:text-gray-300 font-inter flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
            Descartar Cambios
          </button>
          <button
            className="h-[44px] px-5 bg-[#25207E] rounded-lg text-[14px] font-medium text-white font-inter flex items-center gap-2 hover:bg-[#1e1a66] transition-colors"
            style={{ boxShadow: "0 4px 12px rgba(37,32,126,0.25)" }}
          >
            <Save size={16} />
            Guardar Configuración
          </button>
        </div>
      )}
    </div>
  );
}
