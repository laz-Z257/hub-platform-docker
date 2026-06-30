import { describe, it, expect } from "vitest";
import { sendMessageSchema, historyQuerySchema } from "./chat.schema";

describe("sendMessageSchema", () => {
  it("accepts valid content", () => {
    const result = sendMessageSchema.body.parse({ content: "Hola, necesito ayuda" });
    expect(result.content).toBe("Hola, necesito ayuda");
  });

  it("rejects empty content", () => {
    expect(() => sendMessageSchema.body.parse({ content: "" })).toThrow();
  });

  it("rejects content over 2000 characters", () => {
    expect(() =>
      sendMessageSchema.body.parse({ content: "a".repeat(2001) })
    ).toThrow();
  });

  it("rejects missing content", () => {
    expect(() => sendMessageSchema.body.parse({})).toThrow();
  });
});

describe("historyQuerySchema", () => {
  it("defaults limit to 50", () => {
    const result = historyQuerySchema.query.parse({});
    expect(result.limit).toBe(50);
  });

  it("accepts custom limit", () => {
    const result = historyQuerySchema.query.parse({ limit: "10" });
    expect(result.limit).toBe(10);
  });

  it("rejects limit > 200", () => {
    expect(() =>
      historyQuerySchema.query.parse({ limit: "300" })
    ).toThrow();
  });

  it("rejects limit < 1", () => {
    expect(() => historyQuerySchema.query.parse({ limit: "0" })).toThrow();
  });
});
