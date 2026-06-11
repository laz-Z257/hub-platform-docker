"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ApiUser } from "@/types/user";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#F3F0FF", color: "#25207E" },
  user: { bg: "#DBEAFE", color: "#2563EB" },
};

function getInitials(user: ApiUser): string {
  const name = hasName(user) ? user.nombre : user.documento;
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hasName(user: ApiUser): boolean {
  return user.nombre !== user.documento;
}

function displayName(user: ApiUser): string {
  return hasName(user) ? user.nombre : user.documento;
}

function getRelativeTime(dateStr: string, now: number): string {
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 30) return `Hace ${days}d`;
  return `Miembro desde hace ${Math.floor(days / 30)} meses`;
}

export default function UserManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ items: ApiUser[] }>("/users?limit=200")
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        setUsers(items);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Error al cargar usuarios";
        console.error("UserManagement:", msg);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

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
            Usuarios registrados en la plataforma
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/users")}
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
          Ver todos
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Cargando usuarios...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "13px",
            color: "#DC2626",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {/* User Cards */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {!Array.isArray(users) ? null : users.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
                padding: "32px 0",
              }}
            >
              No hay usuarios registrados.
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
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
                  {getInitials(user)}
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
                      {displayName(user)}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "10px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        backgroundColor:
                          ROLE_COLORS[user.rol]?.bg || "#F3F4F6",
                        color: ROLE_COLORS[user.rol]?.color || "#6B7280",
                      }}
                    >
                      {user.rol.toUpperCase()}
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
                    {hasName(user) ? user.documento : "Sin nombre"}
                  </p>
                </div>

                {/* Activity */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: user.estado === "activo" ? "#22C55E" : "#EF4444",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {getRelativeTime(user.ultima_actividad || user.created_at, Date.now())}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
