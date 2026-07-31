"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Send, MapPin, ChevronDown, Search, X, MessageSquare } from "lucide-react";

export default function ReportarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState("");
  const [hasHistory, setHasHistory] = useState(false);

  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [puntoVenta, setPuntoVenta] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [pvList, setPvList] = useState<string[]>([]);
  const [showPvModal, setShowPvModal] = useState(false);
  const [pvSearch, setPvSearch] = useState("");

  const filteredPvList = useMemo(() => {
    if (!pvSearch.trim()) return pvList;
    const q = pvSearch.toLowerCase();
    return pvList.filter((pv) => pv.toLowerCase().includes(q));
  }, [pvList, pvSearch]);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setDocumento(user.documento);
    }
    api.get<{ items: { telefono: string }[]; total: number }>("/incidents?limit=1")
      .then((data) => {
        if (data?.items?.length > 0 && data.items[0].telefono) {
          setTelefono(data.items[0].telefono);
          setHasHistory(true);
        } else if (data?.total && data.total > 0) {
          setHasHistory(true);
        }
      }).catch((err) => logger.error("Error fetching incident history", { error: err instanceof Error ? err.message : err }));
    api.get<{ nombre: string }[]>("/puntos-venta")
      .then((list) => setPvList(list.map((p) => p.nombre)))
      .catch((err) => logger.error("Error fetching puntos de venta", { error: err instanceof Error ? err.message : err }));
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "El nombre no está disponible";
    if (!documento.trim()) e.documento = "El documento no está disponible";
    if (!puntoVenta.trim()) e.puntoVenta = "El punto de venta es requerido";
    if (!descripcion.trim()) e.descripcion = "La descripción es requerida";
    if (!hasHistory && !telefono.trim()) e.telefono = "El teléfono es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");
    try {
      const incident = await api.post<{ id: string }>("/incidents", {
        nombre, documento, punto_venta: puntoVenta, telefono, descripcion,
      });
      router.push(`/user/exito?ticketId=${incident.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#EEEDF8] flex items-center justify-center">
          <span className="text-[#25207E] text-xs font-bold">H</span>
        </div>
        <span className="text-[22px] font-bold text-[#25207E]">CorpSupport</span>
      </div>

      <div className="flex flex-col items-center pt-6 px-4 pb-8">
        <div className="w-20 h-20 rounded-full bg-[#EEEDF8] flex items-center justify-center mb-4">
          <span className="text-[#25207E] text-3xl font-bold">H</span>
        </div>
        <h1 className="text-[34px] font-bold text-[#1F2366] text-center mb-2">Reportar un Incidente</h1>
        <p className="text-[15px] text-[#6B7280] text-center mb-6 max-w-[300px]">
          Por favor, completa los detalles para que nuestro equipo técnico pueda ayudarte.
        </p>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 w-[92%]">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        <div className="bg-white rounded-[18px] border border-[#E5E7EB] p-5 w-[92%] shadow-sm space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Nombre Completo</label>
            <div className="flex items-center gap-2 h-[52px] rounded-input border border-input-border bg-gray-50 px-4">
              <span className="text-[15px] text-[#1F2937]">{nombre}</span>
            </div>
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">CC / Documento</label>
            <div className="flex items-center gap-2 h-[52px] rounded-input border border-input-border bg-gray-50 px-4">
              <span className="text-[15px] text-[#1F2937]">{documento}</span>
            </div>
            {errors.documento && <p className="text-xs text-red-500 mt-1">{errors.documento}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Punto de Venta</label>
            <button
              onClick={() => setShowPvModal(true)}
              className={`flex items-center gap-2 w-full h-[52px] rounded-input border bg-[#F9FAFB] px-4 text-left ${
                errors.puntoVenta ? "border-red-500" : "border-input-border"
              }`}
            >
              <MapPin size={18} color="#9CA3AF" strokeWidth={2} />
              <span className={`flex-1 text-[15px] ${puntoVenta ? "text-[#1F2937]" : "text-[#9CA3AF]"}`}>
                {puntoVenta || "Selecciona un punto de venta"}
              </span>
              <ChevronDown size={18} color="#9CA3AF" strokeWidth={2} />
            </button>
            {errors.puntoVenta && <p className="text-xs text-red-500 mt-1">{errors.puntoVenta}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Número de Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => { setTelefono(e.target.value); if (errors.telefono) setErrors((p) => ({ ...p, telefono: undefined })); }}
              placeholder="Tu número de contacto"
              readOnly={hasHistory}
              className={`w-full h-[52px] rounded-input border bg-[#F9FAFB] px-4 text-[15px] text-[#1F2937] outline-none ${
                hasHistory ? "bg-gray-50 cursor-not-allowed" : ""
              } ${errors.telefono ? "border-red-500" : "border-input-border focus:border-[#25207E]"}`}
            />
            {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => { setDescripcion(e.target.value); if (errors.descripcion) setErrors((p) => ({ ...p, descripcion: undefined })); }}
              placeholder="Describe qué sucedió..."
              rows={4}
              className={`w-full rounded-input border bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#1F2937] outline-none resize-none ${
                errors.descripcion ? "border-red-500" : "border-input-border focus:border-[#25207E]"
              }`}
            />
            {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-[52px] rounded-[10px] bg-[#2A237E] text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-[#1f1a63] transition-colors shadow-lg shadow-[#2A237E]/25"
          >
            <Send size={18} strokeWidth={2.5} />
            {loading ? "Enviando..." : "Enviar Reporte"}
          </button>
        </div>

        <button onClick={() => router.back()} className="flex items-center gap-2 mt-5 text-[#1F2366] text-sm">
          <MessageSquare size={18} strokeWidth={2} />
          Volver al chat
        </button>
      </div>

      {showPvModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPvModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#1F2366]">Seleccionar punto de venta</h2>
              <button onClick={() => setShowPvModal(false)}><X size={22} color="#6B7280" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg h-11 px-3">
                <Search size={18} color="#9CA3AF" />
                <input
                  type="text"
                  value={pvSearch}
                  onChange={(e) => setPvSearch(e.target.value)}
                  placeholder="Buscar punto de venta..."
                  autoFocus
                  className="flex-1 bg-transparent text-[15px] text-[#1F2937] outline-none"
                />
                {pvSearch && <button onClick={() => setPvSearch("")}><X size={18} color="#9CA3AF" /></button>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filteredPvList.length === 0 ? (
                <p className="text-center text-[#9CA3AF] text-sm py-5">
                  {pvList.length === 0 ? "Cargando puntos de venta..." : "No se encontraron resultados"}
                </p>
              ) : (
                filteredPvList.map((pv) => (
                  <button
                    key={pv}
                    onClick={() => { setPuntoVenta(pv); setPvSearch(""); setShowPvModal(false); if (errors.puntoVenta) setErrors((p) => ({ ...p, puntoVenta: undefined })); }}
                    className={`w-full text-left py-3.5 px-3 border-b border-gray-100 rounded-lg mb-0.5 ${
                      puntoVenta === pv ? "bg-[#F3F0FF] text-[#25207E] font-semibold" : "text-[#1F2937] hover:bg-gray-50"
                    }`}
                  >
                    {pv}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
