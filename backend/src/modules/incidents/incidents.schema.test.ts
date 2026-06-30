import { describe, it, expect } from "vitest";
import {
  uuidParamsSchema,
  createIncidentSchema,
  updateIncidentSchema,
  commentSchema,
  listIncidentsQuerySchema,
  statsQuerySchema,
} from "./incidents.schema";

describe("uuidParamsSchema", () => {
  it("accepts a valid UUID", () => {
    const result = uuidParamsSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects an invalid UUID", () => {
    expect(() => uuidParamsSchema.parse({ id: "not-a-uuid" })).toThrow();
  });

  it("rejects missing id", () => {
    expect(() => uuidParamsSchema.parse({})).toThrow();
  });
});

describe("createIncidentSchema", () => {
  const validData = {
    nombre: "Problema con PC",
    documento: "12345678",
    punto_venta: "Sucursal Centro",
    descripcion: "No enciende el monitor",
  };

  it("accepts valid input with all required fields", () => {
    const result = createIncidentSchema.parse(validData);
    expect(result.nombre).toBe("Problema con PC");
    expect(result.telefono).toBe("");
    expect(result.urgencia).toBe("media");
  });

  it("accepts valid input with all optional fields", () => {
    const result = createIncidentSchema.parse({
      ...validData,
      telefono: "123456789",
      urgencia: "alta",
    });
    expect(result.telefono).toBe("123456789");
    expect(result.urgencia).toBe("alta");
  });

  it("rejects empty nombre", () => {
    expect(() =>
      createIncidentSchema.parse({ ...validData, nombre: "" })
    ).toThrow();
  });

  it("rejects nombre over 100 characters", () => {
    expect(() =>
      createIncidentSchema.parse({ ...validData, nombre: "a".repeat(101) })
    ).toThrow();
  });

  it("rejects empty descripcion", () => {
    expect(() =>
      createIncidentSchema.parse({ ...validData, descripcion: "" })
    ).toThrow();
  });

  it("rejects invalid urgencia", () => {
    expect(() =>
      createIncidentSchema.parse({ ...validData, urgencia: "critical" })
    ).toThrow();
  });
});

describe("updateIncidentSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = updateIncidentSchema.parse({});
    expect(result).toEqual({});
  });

  it("accepts valid estado", () => {
    const result = updateIncidentSchema.parse({ estado: "resuelto" });
    expect(result.estado).toBe("resuelto");
  });

  it("rejects invalid estado", () => {
    expect(() =>
      updateIncidentSchema.parse({ estado: "invalid" })
    ).toThrow();
  });

  it("accepts solucion within limit", () => {
    const result = updateIncidentSchema.parse({
      solucion: "Se reinició el equipo",
    });
    expect(result.solucion).toBe("Se reinició el equipo");
  });

  it("rejects solucion over 5000 characters", () => {
    expect(() =>
      updateIncidentSchema.parse({ solucion: "a".repeat(5001) })
    ).toThrow();
  });
});

describe("commentSchema", () => {
  it("accepts valid comment", () => {
    const result = commentSchema.parse({ texto: "Comentario de prueba" });
    expect(result.texto).toBe("Comentario de prueba");
  });

  it("rejects empty texto", () => {
    expect(() => commentSchema.parse({ texto: "" })).toThrow();
  });
});

describe("listIncidentsQuerySchema", () => {
  it("defaults page and limit", () => {
    const result = listIncidentsQuerySchema.query.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("parses page and limit from strings", () => {
    const result = listIncidentsQuerySchema.query.parse({
      page: "2",
      limit: "50",
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it("rejects page < 1", () => {
    expect(() =>
      listIncidentsQuerySchema.query.parse({ page: "0" })
    ).toThrow();
  });

  it("rejects limit > 100", () => {
    expect(() =>
      listIncidentsQuerySchema.query.parse({ limit: "200" })
    ).toThrow();
  });

  it("accepts valid estado", () => {
    const result = listIncidentsQuerySchema.query.parse({ estado: "pendiente" });
    expect(result.estado).toBe("pendiente");
  });

  it("rejects invalid estado", () => {
    expect(() =>
      listIncidentsQuerySchema.query.parse({ estado: "invalid" })
    ).toThrow();
  });

  it("accepts valid start date", () => {
    const result = listIncidentsQuerySchema.query.parse({
      start: "2024-01-01",
    });
    expect(result.start).toBe("2024-01-01");
  });

  it("rejects invalid start date", () => {
    expect(() =>
      listIncidentsQuerySchema.query.parse({ start: "not-a-date" })
    ).toThrow();
  });
});

describe("statsQuerySchema", () => {
  it("accepts empty query", () => {
    const result = statsQuerySchema.query.parse({});
    expect(result).toEqual({});
  });

  it("accepts valid dates", () => {
    const result = statsQuerySchema.query.parse({
      start: "2024-01-01",
      end: "2024-12-31",
    });
    expect(result.start).toBe("2024-01-01");
    expect(result.end).toBe("2024-12-31");
  });

  it("rejects invalid start date", () => {
    expect(() =>
      statsQuerySchema.query.parse({ start: "bad-date" })
    ).toThrow();
  });
});
