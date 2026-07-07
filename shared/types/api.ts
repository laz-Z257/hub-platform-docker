export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KpiResponse {
  totalIncidentes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
  usuariosActivos: number;
}

export interface CompanySettings {
  nombre: string;
  contribuyente: string;
  direccion: string;
}

export interface DashboardSummary {
  hoy: {
    nuevos: number;
    pendientes: number;
    enProceso: number;
    resueltos: number;
    altaUrgencia: number;
    mediaUrgencia: number;
    bajaUrgencia: number;
  };
  total: {
    incidentes: number;
    pendientes: number;
    enProceso: number;
    resueltos: number;
  };
  resolucion: {
    promedioHoras: number;
  };
  usuarios: {
    total: number;
    activos: number;
    bloqueados: number;
  };
  calificaciones: {
    promedio: number;
    total: number;
  };
  puntosVenta: {
    total: number;
    activos: number;
  };
  mensajes: {
    total: number;
  };
  tendencia7Dias: { fecha: string; incidentes: number }[];
  recientes: {
    tickets: {
      id: string;
      nombre: string;
      punto_venta: string;
      descripcion: string;
      urgencia: string;
      estado: string;
      created_at: string;
    }[];
    usuarios: {
      id: string;
      nombre: string;
      documento: string;
      rol: string;
      estado: string;
      ultima_actividad: string | null;
      created_at: string;
    }[];
  };
  horaColombia: string;
}
