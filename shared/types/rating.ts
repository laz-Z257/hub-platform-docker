export interface Rating {
  id: string;
  incident_id: string;
  user_id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
}

export interface RatingWithDetails {
  puntuacion: number;
  comentario: string | null;
  created_at: string;
  incident_id: string;
  usuario_nombre: string;
  punto_venta: string;
  ticket_descripcion: string;
}

export interface PromedioPv {
  punto_venta: string;
  promedio: number;
  total: number;
}

export interface CreateRatingInput {
  puntuacion: number;
  comentario?: string;
}

export interface RatingStats {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
  promedioPv: PromedioPv[];
  ultimas: RatingWithDetails[];
}
