"use client";

import { useState } from "react";

interface StarRatingProps {
  onSubmit: (puntuacion: number, comentario: string) => Promise<void>;
  onCancel: () => void;
}

export function StarRating({ onSubmit, onCancel }: StarRatingProps) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (puntuacion === 0) return;
    setSaving(true);
    try {
      await onSubmit(puntuacion, comentario.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-bold text-[#1F2937] text-center mb-1">
        Califica el servicio
      </h3>
      <p className="text-[13px] text-[#6B7280] text-center mb-4">
        ¿Qué tal fue la atención recibida?
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setPuntuacion(star)}
            className="text-4xl transition-transform hover:scale-110"
          >
            {star <= puntuacion ? "⭐" : "☆"}
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentario opcional..."
        maxLength={500}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#1F2937] min-h-[80px] resize-none outline-none focus:border-[#201A7A] mb-4"
      />

      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 h-11 rounded-lg bg-gray-100 text-[#6B7280] text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || puntuacion === 0}
          className="flex-1 h-11 rounded-lg text-white text-sm font-semibold disabled:bg-gray-400 bg-[#201A7A] hover:bg-[#16145e] transition-colors"
        >
          {saving ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
