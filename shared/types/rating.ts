export interface Rating {
  id: string;
  incident_id: string;
  user_id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
}

export interface CreateRatingInput {
  puntuacion: number;
  comentario?: string;
}

export interface RatingStats {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
  ultimas: Rating[];
}
