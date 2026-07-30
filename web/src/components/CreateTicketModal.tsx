"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

interface CreateTicketModalProps {
  onClose: () => void;
  onCreated: () => void;
  showAlert: (title: string, message: string, type: "info" | "success" | "warning" | "error") => void;
}

export default function CreateTicketModal({ onClose, onCreated, showAlert }: CreateTicketModalProps) {
  const [newTicket, setNewTicket] = useState({
    nombre: "",
    documento: "",
    punto_venta: "",
    telefono: "",
    descripcion: "",
  });
  const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!newTicket.nombre.trim()) errs.nombre = "Requerido";
    if (!newTicket.descripcion.trim()) errs.descripcion = "Requerido";
    if (!newTicket.punto_venta.trim()) errs.punto_venta = "Requerido";
    
    if (Object.keys(errs).length > 0) {
      setTicketErrors(errs);
      return;
    }
    
    setTicketErrors({});
    setCreating(true);
    
    try {
      await api.post("/incidents", newTicket);
      onCreated();
    } catch (err) {
      logger.error("Create ticket error", { error: err instanceof Error ? err.message : err });
      showAlert("Error", "Error al crear ticket", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[100]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-7 w-[460px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter">
            Abrir Nuevo Ticket
          </h2>
          <button
            onClick={() => { onClose(); setTicketErrors({}); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
          >
            <X size={14} color="#6B7280" strokeWidth={2} />
          </button>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Nombre</label>
            <input
              type="text"
              value={newTicket.nombre}
              onChange={(e) => { setNewTicket({ ...newTicket, nombre: e.target.value }); setTicketErrors((p) => ({ ...p, nombre: "" })); }}
              className={`w-full h-11 px-3.5 rounded-lg border ${ticketErrors.nombre ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter outline-none`}
              placeholder="Nombre del solicitante"
            />
            {ticketErrors.nombre && <p className="text-xs text-red-500 mt-1 font-inter">{ticketErrors.nombre}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Documento</label>
            <input
              type="text"
              value={newTicket.documento}
              onChange={(e) => setNewTicket({ ...newTicket, documento: e.target.value })}
              className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter outline-none"
              placeholder="123456789"
            />
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Punto de Venta</label>
            <input
              type="text"
              value={newTicket.punto_venta}
              onChange={(e) => { setNewTicket({ ...newTicket, punto_venta: e.target.value }); setTicketErrors((p) => ({ ...p, punto_venta: "" })); }}
              className={`w-full h-11 px-3.5 rounded-lg border ${ticketErrors.punto_venta ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter outline-none`}
              placeholder="Nombre del punto de venta"
            />
            {ticketErrors.punto_venta && <p className="text-xs text-red-500 mt-1 font-inter">{ticketErrors.punto_venta}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Teléfono</label>
            <input
              type="text"
              value={newTicket.telefono}
              onChange={(e) => setNewTicket({ ...newTicket, telefono: e.target.value })}
              className="w-full h-11 px-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter outline-none"
              placeholder="Número de contacto"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">Descripción</label>
          <textarea
            value={newTicket.descripcion}
            onChange={(e) => { setNewTicket({ ...newTicket, descripcion: e.target.value }); setTicketErrors((p) => ({ ...p, descripcion: "" })); }}
            className={`w-full h-24 px-3.5 py-2 rounded-lg border ${ticketErrors.descripcion ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter outline-none resize-none`}
            placeholder="Describe el problema..."
          />
          {ticketErrors.descripcion && <p className="text-xs text-red-500 mt-1 font-inter">{ticketErrors.descripcion}</p>}
        </div>

        {creating && (
          <p className="text-sm text-gray-500 font-inter mb-3">Creando ticket...</p>
        )}

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="h-10 px-[18px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer text-[13px] font-medium font-inter text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating}
            className="h-10 px-[18px] rounded-lg border-none font-inter text-[13px] font-semibold text-white bg-[#25207E] disabled:bg-[#25207E]/70 disabled:cursor-not-allowed cursor-pointer"
          >
            {creating ? "Creando..." : "Crear Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
