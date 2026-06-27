"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Users, CheckCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import TicketsTable from "@/components/TicketsTable";
import UserManagement from "@/components/UserManagement";
import { api } from "@/lib/api";
import type { Incident } from "@hub/shared/types/incident";

interface KpiResponse {
  totalIncidentes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
  usuariosActivos: number;
}

type IncidentItem = Pick<Incident, "id" | "nombre" | "descripcion" | "urgencia" | "estado" | "created_at">;

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-3">
      <Skeleton className="w-8 h-8" />
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-16 h-6" />
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [kpiError, setKpiError] = useState(false);
  const [incidentsError, setIncidentsError] = useState(false);

  useEffect(() => {
    api.get<KpiResponse>("/dashboard/kpis").then(setKpis).catch(() => setKpiError(true));
    api
      .get<{ items: IncidentItem[] }>("/incidents?limit=5")
      .then((data) => setIncidents(data.items))
      .catch(() => setIncidentsError(true));
  }, []);

  if (kpiError && incidentsError) {
    return (
      <div className="bg-[#F8F8FC] dark:bg-gray-950 min-h-[calc(100vh-70px)] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white font-inter">Error al cargar datos</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-inter mt-1">No se pudieron conectar con el servidor.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 h-10 px-5 bg-[#25207E] text-white rounded-lg text-sm font-inter font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F8FC] dark:bg-gray-950 min-h-[calc(100vh-70px)] p-8">
      <div className="mb-8">
        <h1 className="text-[42px] font-bold text-gray-900 dark:text-white font-inter leading-tight">
          Panel de Control
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 font-inter">
          Bienvenido de nuevo. Aquí tienes un vistazo del estado actual de tu ecosistema.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 max-w-[860px] mb-7">
        {kpis ? (
          <>
            <MetricCard
              icon={<ClipboardList size={20} color="#25207E" strokeWidth={2} />}
              title="Tickets Abiertos"
              value={kpis.totalIncidentes.toLocaleString()}
            />
            <MetricCard
              icon={<Users size={20} color="#25207E" strokeWidth={2} />}
              title="Usuarios Activos"
              value={kpis.usuariosActivos.toLocaleString()}
            />
            <MetricCard
              icon={<CheckCircle size={20} color="#22C55E" strokeWidth={2} />}
              title="Resueltos"
              value={kpis.resueltos.toLocaleString()}
            />
          </>
        ) : (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <TicketsTable incidents={incidents} />
        <UserManagement />
      </div>
    </div>
  );
}
