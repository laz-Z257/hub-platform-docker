export function formatTicketId(id: string): string {
  const short = id.replace(/-/g, "").slice(-8).toUpperCase();
  return `#TK-${short}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
