export interface AuthUser {
  id: string;
  documento: string;
  nombre: string;
  rol: "user" | "admin";
}

export interface LoginInput {
  documento: string;
  contrasena: string;
}

export interface RegisterInput {
  documento: string;
  nombre: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
