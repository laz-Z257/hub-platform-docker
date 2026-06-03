export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "agent";
}

export interface Incident {
  id: string;
  nombre: string;
  documento: string;
  puntoVenta: string;
  telefono: string;
  descripcion: string;
  urgencia: "baja" | "media" | "alta";
  estado: "pendiente" | "en_proceso" | "resuelto";
  fecha: string;
  agente?: string;
  comentarios?: { autor: string; texto: string; fecha: string }[];
}

export interface KpiData {
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  altaUrgencia: number;
}
