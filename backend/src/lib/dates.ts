/**
 * Colombia es UTC-5 fijo (sin horario de verano), así que el día calendario
 * "YYYY-MM-DD" de Colombia se puede delimitar con offset explícito -05:00.
 *
 * Los contenedores corren en UTC: interpretar "2026-08-19" con new Date()
 * da la medianoche UTC, que en Colombia son las 19:00 del día anterior.
 * Estos helpers evitan ese desplazamiento de 5 horas en los filtros de fecha,
 * alineándolos con getColombiaNow del dashboard.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Inicio del día calendario en Colombia (00:00:00-05:00) para "YYYY-MM-DD" */
export function colombiaDayStart(dateStr: string): Date {
  if (DATE_ONLY.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00-05:00`);
  }
  return new Date(dateStr);
}

/** Fin del día calendario en Colombia (23:59:59.999-05:00) para "YYYY-MM-DD" */
export function colombiaDayEnd(dateStr: string): Date {
  if (DATE_ONLY.test(dateStr)) {
    return new Date(`${dateStr}T23:59:59.999-05:00`);
  }
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
