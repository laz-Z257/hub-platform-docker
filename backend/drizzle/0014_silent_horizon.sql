ALTER TABLE "ratings" ADD CONSTRAINT "ratings_puntuacion_check" CHECK ("puntuacion" >= 1 AND "puntuacion" <= 5);
