"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Ticket,
  Plug,
  Settings,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Panel de control", active: true },
  { icon: BarChart3, label: "Analítica", active: false },
  { icon: Users, label: "Gestión de Usuarios", active: false },
  { icon: Ticket, label: "Tickets", active: false },
  { icon: Plug, label: "Sistemas Externos", active: false },
  { icon: Settings, label: "Configuración", active: false },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "250px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "20px 20px 24px",
          gap: "10px",
        }}
      >
        <Image
          src={logoImg}
          alt="Logo"
          width={32}
          height={32}
          style={{ borderRadius: "6px" }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#374151",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Admin Dashboard
        </span>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 12px",
          gap: "2px",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              height: "48px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: item.active ? "#F3F0FF" : "transparent",
              color: item.active ? "#25207E" : "#6B7280",
              padding: "0 12px",
              gap: "12px",
              position: "relative",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: item.active ? 600 : 400,
              textAlign: "left",
              width: "100%",
              transition: "background-color 0.15s",
            }}
          >
            {item.active && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "8px",
                  bottom: "8px",
                  width: "4px",
                  backgroundColor: "#25207E",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            )}
            <item.icon
              size={20}
              color={item.active ? "#25207E" : "#9CA3AF"}
              strokeWidth={item.active ? 2.5 : 2}
            />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderTop: "1px solid #E5E7EB",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#25207E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}
        >
          AP
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#1F2937",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Admin Principal
        </span>
      </div>
    </aside>
  );
}
