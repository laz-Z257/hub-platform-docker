import { describe, it, expect } from "vitest";
import { kpisQuerySchema } from "./dashboard.schema";

describe("kpisQuerySchema", () => {
  it("accepts empty query", () => {
    const result = kpisQuerySchema.query.parse({});
    expect(result).toEqual({});
  });

  it("accepts valid start date", () => {
    const result = kpisQuerySchema.query.parse({ start: "2024-01-01" });
    expect(result.start).toBe("2024-01-01");
  });

  it("accepts valid end date", () => {
    const result = kpisQuerySchema.query.parse({ end: "2024-12-31" });
    expect(result.end).toBe("2024-12-31");
  });

  it("accepts agente filter", () => {
    const result = kpisQuerySchema.query.parse({ agente: "John" });
    expect(result.agente).toBe("John");
  });

  it("rejects invalid start date", () => {
    expect(() =>
      kpisQuerySchema.query.parse({ start: "not-a-date" })
    ).toThrow();
  });

  it("rejects invalid end date", () => {
    expect(() =>
      kpisQuerySchema.query.parse({ end: "bad-date" })
    ).toThrow();
  });
});
