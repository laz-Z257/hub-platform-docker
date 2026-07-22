"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#F8F8FC] dark:bg-gray-950">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-inter">
        Algo salió mal
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md font-inter text-sm">
        {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <button
        onClick={reset}
        className="mt-6 h-11 px-6 bg-[#25207E] text-white rounded-lg font-inter text-sm font-semibold hover:bg-[#1e1b6b] transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
