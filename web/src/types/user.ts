export interface ApiUser {
  id: string;
  documento: string;
  nombre: string;
  email: string | null;
  rol: "user" | "asesor" | "admin" | "tecnico";
  estado: "activo" | "bloqueado";
  ultima_actividad: string | null;
  created_at: string;
  bloqueado_por: string | null;
  bloqueado_por_documento?: string | null;
}
