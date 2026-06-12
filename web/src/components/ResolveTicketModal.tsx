"use client";

import { useState, useRef } from "react";
import { CheckCircle, Upload, X } from "lucide-react";
import { api } from "@/lib/api";

interface ResolveTicketModalProps {
  ticketId: string;
  ticketLabel: string;
  onClose: () => void;
  onResolved: (ticketId: string, solucion: string, imagenUrl?: string) => void;
}

export default function ResolveTicketModal({ ticketId, ticketLabel, onClose, onResolved }: ResolveTicketModalProps) {
  const [solucion, setSolucion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solucion.trim()) {
      setError("La descripción de la solución es requerida");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let imagenUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Error al subir la imagen");
        }
        const uploadData = await uploadRes.json();
        imagenUrl = uploadData.url;
      }

      await api.patch(`/incidents/${ticketId}`, {
        estado: "resuelto",
        solucion: solucion.trim(),
        imagen_url: imagenUrl,
      });

      onResolved(ticketId, solucion.trim(), imagenUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar el ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[100]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-7 w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-gray-900/30"
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          <CheckCircle size={22} color="#22C55E" strokeWidth={2.5} />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter">
            Cerrar Ticket
          </h2>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-inter mb-6">
          Ticket: <strong>{ticketLabel}</strong>
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 mb-4 text-[13px] text-red-600 dark:text-red-400 font-inter">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">
              ¿Cómo se resolvió?
            </label>
            <textarea
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              className="w-full h-24 px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 text-sm font-inter text-gray-800 dark:text-gray-100 outline-none focus:border-[#25207E] resize-none"
              placeholder="Describe los pasos o la solución aplicada..."
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-inter mb-1.5">
              Imagen (opcional)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Preview" className="h-24 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#F9FAFB] dark:bg-gray-800 cursor-pointer text-[13px] font-inter text-gray-500 dark:text-gray-400 hover:border-[#25207E]"
              >
                <Upload size={16} />
                Seleccionar archivo
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-[18px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer text-[13px] font-medium font-inter text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-[18px] rounded-lg border-none font-inter text-[13px] font-semibold text-white"
              style={{
                backgroundColor: saving ? "rgba(34,197,94,0.7)" : "#22C55E",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Cerrando..." : "Cerrar Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
