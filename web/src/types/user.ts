export interface ApiUser {
  id: string;
  documento: string;
  nombre: string;
  email: string | null;
  rol: "admin" | "user";
  estado: "activo" | "bloqueado";
  ultima_actividad: string | null;
  created_at: string;
}
