"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, X, Sun, Moon, Trash2, RefreshCw, Database, RotateCcw, ShieldBan, Cloud, Server } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { CompanySettings } from "@hub/shared/types/api";

const TABS = [
  { label: "Perfil de la Empresa", key: "empresa" },
  { label: "Apariencia", key: "apariencia" },
  { label: "Seguridad", key: "seguridad" },
  { label: "Notificaciones", key: "notificaciones" },
  { label: "Mantenimiento", key: "mantenimiento" },
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

function getCacheStats() {
  if (typeof localStorage === "undefined") return { items: 0, size: "0 KB", lsItems: 0, ssItems: 0 };
  const lsItems = localStorage.length || 0;
  const ssItems = typeof sessionStorage !== "undefined" ? sessionStorage.length || 0 : 0;
  let totalBytes = 0;
  if (lsItems) {
    for (let i = 0; i < lsItems; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalBytes += key.length * 2;
        totalBytes += (localStorage.getItem(key)?.length || 0) * 2;
      }
    }
  }
  const size = totalBytes < 1024
    ? `${totalBytes} B`
    : totalBytes < 1048576
      ? `${(totalBytes / 1024).toFixed(1)} KB`
      : `${(totalBytes / 1048576).toFixed(1)} MB`;
  return { items: lsItems + ssItems, size, lsItems, ssItems };
}

const SETTINGS_KEY = "hub-platform-settings";

const defaultSettings: CompanySettings = {
  nombre: "Mi Empresa",
  contribuyente: "",
  direccion: "",
};

function loadSettings(): CompanySettings {
  if (typeof localStorage === "undefined") return defaultSettings;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isTecnico = user?.rol === "tecnico";
  const [activeTab, setActiveTab] = useState("empresa");
  const { theme, setTheme } = useTheme();
  const cacheStats = getCacheStats();
  const [settings, setSettings] = useState<CompanySettings>(loadSettings);
  const [originalSettings, setOriginalSettings] = useState<CompanySettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"local" | "saved" | "error">("local");

  useEffect(() => {
    api.get<CompanySettings>("/settings").then((server) => {
      if (server.nombre || server.contribuyente || server.direccion) {
        setSettings(server);
        setOriginalSettings(server);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(server));
        setSyncStatus("saved");
      }
    }).catch(() => {});
  }, []);

  const hasChanges =
    settings.nombre !== originalSettings.nombre ||
    settings.contribuyente !== originalSettings.contribuyente ||
    settings.direccion !== originalSettings.direccion;

  async function handleSave() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setOriginalSettings({ ...settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSyncing(true);
    try {
      await api.put("/settings", settings);
      setSyncStatus("saved");
    } catch {
      setSyncStatus("error");
    } finally {
      setSyncing(false);
    }
  }

  function handleDiscard() {
    setSettings({ ...originalSettings });
  }

  return (
    <div className="min-h-full bg-[#F7F8FC] dark:bg-gray-950 px-8 py-7">
      {/* Header */}
      <div className="mb-7">
        <h1
          className="font-inter font-bold text-gray-900 dark:text-white text-[42px] leading-[1.1]"
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
      {isTecnico && (
        <div className="mt-7 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 flex items-center gap-4">
          <ShieldBan size={24} color="#D97706" strokeWidth={2} />
          <p className="text-[14px] text-amber-700 dark:text-amber-400 font-inter">
            No tienes permisos para modificar la configuración. Contacta a un administrador.
          </p>
        </div>
      )}

      {activeTab === "empresa" && (
        <div className="flex gap-6 mt-7">
          {/* Left column */}
          <div className="flex-[7]">
            {/* General Information Card */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h2
                className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6 text-[30px] leading-[1.2]"
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
                    value={settings.nombre}
                    onChange={(e) => setSettings((s) => ({ ...s, nombre: e.target.value }))}
                    disabled={isTecnico}
                    className="w-full h-[42px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 text-[14px] text-gray-900 dark:text-gray-100 font-inter outline-none focus:border-[var(--brand)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-medium text-[#374151] dark:text-gray-300 font-inter mb-1.5">
                    ID de Contribuyente
                  </label>
                  <input
                    type="text"
                    value={settings.contribuyente}
                    onChange={(e) => setSettings((s) => ({ ...s, contribuyente: e.target.value }))}
                    disabled={isTecnico}
                    className="w-full h-[42px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 text-[14px] text-gray-900 dark:text-gray-100 font-inter outline-none focus:border-[var(--brand)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[14px] font-medium text-[#374151] dark:text-gray-300 font-inter mb-1.5">
                  Dirección Fiscal
                </label>
                <textarea
                  value={settings.direccion}
                  onChange={(e) => setSettings((s) => ({ ...s, direccion: e.target.value }))}
                  disabled={isTecnico}
                  rows={3}
                  className="w-full h-[80px] bg-[#F9FAFB] dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600 rounded-md px-3 py-2 text-[14px] text-[#1F2937] dark:text-gray-100 font-inter outline-none focus:border-[#25207E] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-[3]">
            {/* Logo Card */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6 flex flex-col items-center">
              <h2
                className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6 self-start text-[30px] leading-[1.2]"
              >
                Logo Corporativo
              </h2>
              <div className="w-[140px] h-[140px] bg-[#F8FAFC] dark:bg-gray-800 border-2 border-dashed border-[#CBD5E1] dark:border-gray-600 rounded-full flex items-center justify-center">
                <Image
                  src={logoImg}
                  alt="Company Logo"
                  width={80}
                  height={80}
                  className="rounded-md object-contain"
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
              className="font-inter font-bold text-[#1F2937] dark:text-gray-100 mb-6 text-[30px] leading-[1.2]"
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
                onClick={() => setTheme("dark")}
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
      )}

      {/* Tab Content - Mantenimiento */}
      {activeTab === "mantenimiento" && (
        <div className="mt-7 flex gap-6">
          <div className="flex-[7] flex flex-col gap-6">
            {/* Clear App Cache */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <Trash2 size={20} color="#DC2626" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[#1F2937] dark:text-gray-100 font-inter mb-1">
                    Limpiar Caché Local
                  </h3>
                  <div className="flex gap-3 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <Database size={12} color="#6B7280" />
                      <span className="text-[12px] text-[#6B7280] dark:text-gray-400 font-inter font-medium">{cacheStats.lsItems} localStorage</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <Database size={12} color="#6B7280" />
                      <span className="text-[12px] text-[#6B7280] dark:text-gray-400 font-inter font-medium">{cacheStats.ssItems} sessionStorage</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F3F0FF] rounded-md">
                      <Trash2 size={12} color="#25207E" />
                      <span className="text-[12px] text-[#25207E] font-inter font-semibold">{cacheStats.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      alert(`Caché local limpiado correctamente (${cacheStats.size}, ${cacheStats.items} ítems eliminados). Se recargará la página.`);
                      window.location.reload();
                    }}
                    className="h-[38px] px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-[13px] font-semibold text-red-600 dark:text-red-400 font-inter flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                    Limpiar caché
                  </button>
                </div>
              </div>
            </div>

            {/* Recargar Datos */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center shrink-0">
                  <RefreshCw size={20} color="#2563EB" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[#1F2937] dark:text-gray-100 font-inter mb-1">
                    Recargar Datos
                  </h3>
                  <p className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter mb-4">
                    Vuelve a cargar todos los datos desde el servidor sin limpiar la caché local.
                    Útil cuando los datos no se actualizan correctamente.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="h-[38px] px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-[13px] font-semibold text-blue-600 dark:text-blue-400 font-inter flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <RefreshCw size={15} strokeWidth={2} />
                    Recargar página
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Settings */}
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <RotateCcw size={20} color="#D97706" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[#1F2937] dark:text-gray-100 font-inter mb-1">
                    Restablecer Configuración
                  </h3>
                  <p className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter mb-4">
                    Restaura todas las preferencias locales a sus valores por defecto.
                    Solo afecta configuración del navegador, no datos del servidor.
                  </p>
                  <div className="mb-4 text-[12px] text-[#6B7280] dark:text-gray-400 font-inter bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2">
                    Se eliminarán <strong>{cacheStats.items}</strong> ítems (<strong>{cacheStats.size}</strong>) de localStorage y sessionStorage.
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de restablecer toda la configuración local? (${cacheStats.items} ítems, ${cacheStats.size})`)) {
                        localStorage.clear();
                        sessionStorage.clear();
                        alert(`Configuración restablecida (${cacheStats.size} eliminados). Se recargará la página.`);
                        window.location.reload();
                      }
                    }}
                    className="h-[38px] px-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[13px] font-semibold text-amber-600 dark:text-amber-400 font-inter flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <RotateCcw size={15} strokeWidth={2} />
                    Restablecer todo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-[3]">
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#E9E6FF] flex items-center justify-center mb-4">
                <Database size={20} color="var(--brand)" strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-[#1F2937] dark:text-gray-100 font-inter mb-2">
                Información del Sistema
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-inter">
                  <span className="text-[#6B7280] dark:text-gray-400">Navegador</span>
                  <span className="text-[#1F2937] dark:text-gray-100 font-medium">
                    {typeof window !== "undefined"
                      ? /Chrome/.test(navigator.userAgent) ? "Chrome" :
                        /Firefox/.test(navigator.userAgent) ? "Firefox" :
                        /Safari/.test(navigator.userAgent) ? "Safari" :
                        /Edg/.test(navigator.userAgent) ? "Edge" :
                        "Otro"
                      : "Servidor"}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-inter">
                  <span className="text-[#6B7280] dark:text-gray-400">Almacenamiento</span>
                  <span className="text-[#1F2937] dark:text-gray-100 font-medium">{cacheStats.size}</span>
                </div>
                <div className="flex justify-between text-[13px] font-inter">
                  <span className="text-[#6B7280] dark:text-gray-400">Items en caché</span>
                  <span className="text-[#1F2937] dark:text-gray-100 font-medium">{cacheStats.items}</span>
                </div>
                <div className="flex justify-between text-[13px] font-inter">
                  <span className="text-[#6B7280] dark:text-gray-400">Versión</span>
                  <span className="text-[#1F2937] dark:text-gray-100 font-medium">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync indicator */}
      {activeTab === "empresa" && (
        <div className="flex items-center gap-2 mt-4 mb-2">
          {syncing ? (
            <RefreshCw size={14} className="text-[#6B7280] animate-spin" />
          ) : syncStatus === "saved" ? (
            <Cloud size={14} className="text-green-500" />
          ) : syncStatus === "error" ? (
            <Server size={14} className="text-red-500" />
          ) : (
            <Database size={14} className="text-[#9CA3AF]" />
          )}
          <span className="text-[12px] font-inter text-[#6B7280]">
            {syncing ? "Sincronizando..." : syncStatus === "saved" ? "Guardado en servidor" : syncStatus === "error" ? "Error al sincronizar" : "Solo almacenamiento local"}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {activeTab === "empresa" && !isTecnico && (
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className={`h-[44px] px-5 border rounded-lg text-[14px] font-medium font-inter flex items-center gap-2 transition-colors ${
              hasChanges
                ? "bg-white dark:bg-gray-900 border-[#D1D5DB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                : "bg-white dark:bg-gray-900 border-[#D1D5DB] dark:border-gray-600 text-[#9CA3AF] dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            <X size={16} />
            Descartar Cambios
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`h-[44px] px-5 rounded-lg text-[14px] font-medium font-inter flex items-center gap-2 transition-colors ${
              hasChanges
                ? "bg-[#25207E] text-white hover:bg-[#1e1b6b]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Save size={16} />
            {saved ? "Guardado" : "Guardar Configuración"}
          </button>
        </div>
      )}
    </div>
  );
}
