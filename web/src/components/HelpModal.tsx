"use client";

import { X } from "lucide-react";

const HELP_INFO = {
  version: "1.0.0",
  backend: "hub-platform-api.onrender.com",
  contacto: {
    email: "soporte@hubplatform.com",
    telefono: "+57 300 000 0000",
  },
  atajos: [
    { key: "Ctrl + N", desc: "Abrir nuevo ticket" },
    { key: "Ctrl + F", desc: "Buscar en la tabla actual" },
  ],
};

export default function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-[400px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-inter">
            Ayuda Rápida
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border-none cursor-pointer"
          >
            <X size={16} color="#6B7280" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Información del Sistema">
            <Row label="Versión" value={HELP_INFO.version} />
            <Row label="Backend" value={HELP_INFO.backend} />
          </Section>

          <Section title="Contacto">
            <Row label="Email" value={HELP_INFO.contacto.email} />
            <Row label="Teléfono" value={HELP_INFO.contacto.telefono} />
          </Section>

          <Section title="Atajos">
            {HELP_INFO.atajos.map((a) => (
              <Row key={a.key} label={a.key} value={a.desc} />
            ))}
          </Section>

          <p className="text-xs text-gray-400 dark:text-gray-500 font-inter leading-relaxed">
            Si necesitas asistencia adicional, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 font-inter">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-inter">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-inter text-right">{value}</span>
    </div>
  );
}
