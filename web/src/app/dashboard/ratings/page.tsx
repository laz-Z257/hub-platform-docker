"use client";

import { useState, useEffect } from "react";
import { Star, StarHalf, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";

interface RatingStats {
  promedio: number;
  total: number;
  distribucion: Record<string, number>;
  ultimas: Array<{
    puntuacion: number;
    comentario: string | null;
    created_at: string;
    incident_id: string;
  }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RatingsPage() {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RatingStats>("/ratings")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8 flex items-center justify-center">
        <p className="text-[#6B7280] font-inter text-sm">Cargando calificaciones...</p>
      </div>
    );
  }

  const starLabels: Record<number, string> = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  };

  return (
    <div className="bg-[#F7F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8">
      <div className="mb-7">
        <h1 className="text-[42px] font-bold text-[#25207E] font-inter leading-tight">
          Calificaciones
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
          Encuestas de satisfacción enviadas por los usuarios después de resolver sus tickets.
        </p>
      </div>

      {!stats || stats.total === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-12 text-center">
          <Star size={48} color="#9CA3AF" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400 font-inter">
            No hay calificaciones todavía. Las calificaciones aparecerán aquí cuando los usuarios evalúen sus tickets resueltos.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <Star size={20} color="#F59E0B" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  Promedio
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                  {stats.promedio.toFixed(1)}
                </span>
                <span className="text-sm text-[#F59E0B]">
                  {"★".repeat(Math.round(stats.promedio))}{"☆".repeat(5 - Math.round(stats.promedio))}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <TrendingUp size={20} color="#25207E" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  Total
                </span>
              </div>
              <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                {stats.total}
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                  <Users size={20} color="#22C55E" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px]">
                  % Positivas
                </span>
              </div>
              <span className="text-4xl font-bold text-[#1F2937] dark:text-gray-100 font-inter">
                {Math.round(((stats.distribucion["4"] || 0) + (stats.distribucion["5"] || 0)) / stats.total * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-6">
            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
                Distribución
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribucion[String(star)] || 0;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const colors = ["#22C55E", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-16 text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">
                        {starLabels[star]}
                      </span>
                      <span className="w-5 text-[13px] text-[#1F2937] dark:text-gray-100 font-inter font-semibold">
                        {star}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#F3F4F6] dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: colors[5 - star],
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-[12px] text-[#6B7280] dark:text-gray-400 font-inter">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#9CA3AF] dark:text-gray-400 font-inter uppercase tracking-[0.3px] mb-5">
                Últimas calificaciones
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {stats.ultimas.map((r, i) => (
                  <div
                    key={i}
                    className="border border-[#F3F4F6] dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#F59E0B]">
                        {"★".repeat(r.puntuacion)}{"☆".repeat(5 - r.puntuacion)}
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] dark:text-gray-400 font-inter">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    {r.comentario && (
                      <p className="text-[12px] text-[#6B7280] dark:text-gray-400 font-inter mt-1">
                        {r.comentario}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
