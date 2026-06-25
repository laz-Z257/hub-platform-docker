"use client";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-semibold text-text-dark">Error al cargar</h2>
      <p className="text-text-muted mt-2 text-center max-w-md">
        {error.message || "No se pudo cargar la página de inicio de sesión."}
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
