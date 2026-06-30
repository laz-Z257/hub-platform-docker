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
