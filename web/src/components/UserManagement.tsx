interface UserData {
  name: string;
  role: string;
  roleLabel: string;
  status: string;
}

const USERS: UserData[] = [
  {
    name: "Elena Rodríguez",
    role: "ADMIN",
    roleLabel: "Desarrolladora Senior",
    status: "Hace 2m",
  },
  {
    name: "Marcos Silva",
    role: "EDITOR",
    roleLabel: "Analista de Datos",
    status: "En línea",
  },
  {
    name: "Juan Delgado",
    role: "VIEWER",
    roleLabel: "Soporte Nivel 2",
    status: "Hace 1h",
  },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: "#F3F0FF", color: "#25207E" },
  EDITOR: { bg: "#DBEAFE", color: "#2563EB" },
  VIEWER: { bg: "#F3F4F6", color: "#6B7280" },
};

export default function UserManagement() {
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
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#1F2937",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Gestión de Usuarios
          </h3>
          <p
            style={{
              margin: 0,
              marginTop: "4px",
              fontSize: "13px",
              color: "#6B7280",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Usuarios recientemente activos en la plataforma
          </p>
        </div>
        <button
          style={{
            backgroundColor: "#25207E",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
          }}
        >
          Invitar Usuario
        </button>
      </div>

      {/* User Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {USERS.map((user) => (
          <div
            key={user.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              border: "1px solid #F3F4F6",
              borderRadius: "10px",
              gap: "14px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#F3F0FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#25207E",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                flexShrink: 0,
              }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1F2937",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {user.name}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    backgroundColor: ROLE_COLORS[user.role]?.bg,
                    color: ROLE_COLORS[user.role]?.color,
                  }}
                >
                  {user.role}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6B7280",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {user.roleLabel}
              </p>
            </div>

            {/* Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {user.status === "En línea" && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#22C55E",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {user.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
