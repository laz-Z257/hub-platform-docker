"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-xl font-semibold text-gray-900">Error en Analytics</h2>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        {error.message || "Ocurrió un error al cargar los datos de analytics."}
      </p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-2 bg-[#25207E] text-white rounded-lg hover:bg-[#25207E]-dark transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
