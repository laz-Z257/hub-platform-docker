"use client";

export default function TicketsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-xl font-semibold text-text-dark">Error en Tickets</h2>
      <p className="text-text-muted mt-2 text-center max-w-md">
        {error.message || "Ocurrió un error al cargar los tickets."}
      </p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-2 bg-primary text-white rounded-button hover:bg-primary-dark transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
