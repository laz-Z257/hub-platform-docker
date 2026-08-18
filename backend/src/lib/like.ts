/**
 * Escapa wildcards de LIKE/ILIKE (% y _) para que la entrada del usuario
 * se interprete literalmente (evita LIKE-injection y full-scans con %%).
 * Postgres usa backslash como escape por defecto en LIKE.
 */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}
