"use client";

import { X } from "lucide-react";
import { useState } from "react";

const HELP_INFO = {
  version: "1.0.0",
  contacto: {
    whatsapp: "https://wa.me/573000000000",
    telefono: "+57 300 000 0000",
  },
  faq: [
    { pregunta: "¿Cómo crear un usuario?", respuesta: "Ve a Gestión de Usuarios y haz clic en 'Añadir Usuario'. Completa los campos requeridos y guarda." },
    { pregunta: "¿Cómo resolver un ticket?", respuesta: "Desde la página de Tickets, selecciona el ticket y elige la opción 'Resuelto'. Puedes agregar una solución." },
    { pregunta: "¿Cómo exportar datos?", respuesta: "En la página de Analítica, selecciona un rango de fechas y haz clic en 'Exportar Datos'." },
  ],
};

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          <Section title="Versión">
            <p className="text-sm text-gray-900 dark:text-gray-100 font-inter">
              HUB Platform v{HELP_INFO.version}
            </p>
          </Section>

          <Section title="Contacto">
            <a
              href={HELP_INFO.contacto.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2 px-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 no-underline"
            >
              <span className="text-xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 font-inter">
                  WhatsApp
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-inter">
                  {HELP_INFO.contacto.telefono}
                </p>
              </div>
            </a>
          </Section>

          <Section title="Preguntas Frecuentes">
            <div className="space-y-1">
              {HELP_INFO.faq.map((item, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-none cursor-pointer text-left"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-inter flex-1 pr-2">
                      {item.pregunta}
                    </span>
                    <span className={`text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 pt-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-inter leading-relaxed">
                        {item.respuesta}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <p className="text-xs text-gray-400 dark:text-gray-500 font-inter leading-relaxed text-center">
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

