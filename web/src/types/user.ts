export interface ApiUser {
  id: string;
  documento: string;
  nombre: string;
  email: string | null;
  rol: "admin" | "user";
  created_at: string;
}
