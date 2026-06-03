"use client";

import { ClipboardList, Users, Plug } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import TicketsTable from "@/components/TicketsTable";
import UserManagement from "@/components/UserManagement";

export default function DashboardPage() {
  return (
    <div
      style={{
        backgroundColor: "#F8F8FC",
        minHeight: "calc(100vh - 70px)",
        padding: "32px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "42px",
            fontWeight: 700,
            color: "#25207E",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.2,
          }}
        >
          Panel de Control
        </h1>
        <p
          style={{
            margin: 0,
            marginTop: "6px",
            fontSize: "14px",
            color: "#6B7280",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Bienvenido de nuevo. Aquí tienes un vistazo del estado actual de tu
          ecosistema.
        </p>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          maxWidth: "860px",
          marginBottom: "28px",
        }}
      >
        <MetricCard
          icon={<ClipboardList size={20} color="#25207E" strokeWidth={2} />}
          title="Tickets Abiertos"
          value="1,284"
        />
        <MetricCard
          icon={<Users size={20} color="#25207E" strokeWidth={2} />}
          title="Usuarios Activos"
          value="42,891"
        />
        <MetricCard
          icon={<Plug size={20} color="#25207E" strokeWidth={2} />}
          title="Sistemas Conectados"
          value="18"
        />
      </div>

      {/* Tickets + Users Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <TicketsTable />
        <UserManagement />
      </div>
    </div>
  );
}
