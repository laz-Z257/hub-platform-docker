"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Users, CheckCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import TicketsTable from "@/components/TicketsTable";
import UserManagement from "@/components/UserManagement";
import { api } from "@/lib/api";

interface KpiResponse {
  totalIncidentes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
  usuariosActivos: number;
}

interface IncidentItem {
  id: string;
  nombre: string;
  descripcion: string;
  urgencia: string;
  estado: string;
  created_at: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);

  useEffect(() => {
    api.get<KpiResponse>("/dashboard/kpis").then(setKpis).catch((err) => {
      console.error("Dashboard KPIs:", err instanceof Error ? err.message : err);
    });
    api
      .get<{ items: IncidentItem[] }>("/incidents?limit=5")
      .then((data) => setIncidents(data.items))
      .catch((err) => {
        console.error("Dashboard incidents:", err instanceof Error ? err.message : err);
      });
  }, []);

  return (
    <div className="bg-[#F8F8FC] dark:bg-gray-950 min-h-[calc(100vh-70px)] p-8">
      <div className="mb-8">
        <h1 className="text-[42px] font-bold text-[#25207E] font-inter leading-tight">
          Panel de Control
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 font-inter">
          Bienvenido de nuevo. Aquí tienes un vistazo del estado actual de tu ecosistema.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 max-w-[860px] mb-7">
        <MetricCard
          icon={<ClipboardList size={20} color="#25207E" strokeWidth={2} />}
          title="Tickets Abiertos"
          value={kpis ? kpis.totalIncidentes.toLocaleString() : "..."}
        />
        <MetricCard
          icon={<Users size={20} color="#25207E" strokeWidth={2} />}
          title="Usuarios Activos"
          value={kpis ? kpis.usuariosActivos.toLocaleString() : "..."}
        />
        <MetricCard
          icon={<CheckCircle size={20} color="#22C55E" strokeWidth={2} />}
          title="Resueltos"
          value={kpis ? kpis.resueltos.toLocaleString() : "..."}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <TicketsTable incidents={incidents} />
        <UserManagement />
      </div>
    </div>
  );
}
