/**
 * Detecta violación de unique constraint de PostgreSQL (23505).
 * Se usa en los catch de los controllers para devolver 409 en vez de 500
 * cuando una carrera de checks previos pierde contra el constraint.
 */
export function isUniqueViolation(error: unknown): boolean {
  const err = error as Error & { code?: string };
  return (
    err?.code === "23505" ||
    err?.message?.includes("unique constraint") ||
    err?.message?.includes("duplicate key")
  );
}
