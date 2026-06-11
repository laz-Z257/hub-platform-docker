export interface ApiUser {
  id: string;
  documento: string;
  nombre: string;
  email: string | null;
  rol: "user" | "asesor" | "admin";
  estado: "activo" | "bloqueado";
  ultima_actividad: string | null;
  created_at: string;
}
