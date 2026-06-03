interface Ticket {
  id: string;
  asunto: string;
  prioridad: "CRÍTICA" | "ALTA" | "MEDIA" | "BAJA";
  estado: "En Proceso" | "Pendiente" | "Resuelto";
}

const PRIORITY_STYLES: Record<string, React.CSSProperties> = {
  CRÍTICA: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
  },
  ALTA: {
    backgroundColor: "#DBEAFE",
    color: "#2563EB",
  },
  MEDIA: {
    backgroundColor: "#F3F0FF",
    color: "#7C3AED",
  },
  BAJA: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  "En Proceso": { backgroundColor: "#FBBF24" },
  Pendiente: { backgroundColor: "#3B82F6" },
  Resuelto: { backgroundColor: "#22C55E" },
};

const TICKETS: Ticket[] = [
  { id: "#TIC-8921", asunto: "Error de autenticación SSO", prioridad: "CRÍTICA", estado: "En Proceso" },
  { id: "#TIC-8920", asunto: "Solicitud de nuevo rol de API", prioridad: "MEDIA", estado: "Pendiente" },
  { id: "#TIC-8919", asunto: "Latencia en Cloud Storage Oeste", prioridad: "ALTA", estado: "Resuelto" },
  { id: "#TIC-8918", asunto: "Actualización de términos legales", prioridad: "BAJA", estado: "Resuelto" },
];

export default function TicketsTable() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "14px",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "#1F2937",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Tickets Recientes
        </h3>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color: "#25207E",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Ver todo &rarr;
        </button>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              ID
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Asunto
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Prioridad
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {TICKETS.map((ticket) => (
            <tr
              key={ticket.id}
              style={{ borderTop: "1px solid #F3F4F6" }}
            >
              <td
                style={{
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#25207E",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {ticket.id}
              </td>
              <td
                style={{
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1F2937",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {ticket.asunto}
              </td>
              <td style={{ padding: "12px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    ...PRIORITY_STYLES[ticket.prioridad],
                  }}
                >
                  {ticket.prioridad}
                </span>
              </td>
              <td style={{ padding: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      ...STATUS_STYLES[ticket.estado],
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {ticket.estado}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
