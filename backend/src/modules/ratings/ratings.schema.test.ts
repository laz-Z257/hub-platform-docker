import { describe, it, expect } from "vitest";
import { createRatingSchema, ratingParamsSchema } from "./ratings.schema";

describe("createRatingSchema", () => {
  it("accepts valid puntuacion", () => {
    const result = createRatingSchema.parse({ puntuacion: 5 });
    expect(result.puntuacion).toBe(5);
  });

  it("accepts valid puntuacion with comentario", () => {
    const result = createRatingSchema.parse({
      puntuacion: 3,
      comentario: "Buen servicio",
    });
    expect(result.comentario).toBe("Buen servicio");
  });

  it("rejects puntuacion < 1", () => {
    expect(() => createRatingSchema.parse({ puntuacion: 0 })).toThrow();
  });

  it("rejects puntuacion > 5", () => {
    expect(() => createRatingSchema.parse({ puntuacion: 6 })).toThrow();
  });

  it("rejects non-integer puntuacion", () => {
    expect(() => createRatingSchema.parse({ puntuacion: 3.5 })).toThrow();
  });

  it("rejects missing puntuacion", () => {
    expect(() => createRatingSchema.parse({})).toThrow();
  });

  it("rejects comentario over 1000 characters", () => {
    expect(() =>
      createRatingSchema.parse({
        puntuacion: 5,
        comentario: "a".repeat(1001),
      })
    ).toThrow();
  });
});

describe("ratingParamsSchema", () => {
  it("accepts valid UUID", () => {
    const result = ratingParamsSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid UUID", () => {
    expect(() => ratingParamsSchema.parse({ id: "bad" })).toThrow();
  });
});
