import { describe, it, expect } from "vitest";
import { registerPushSchema } from "./push.schema";

describe("registerPushSchema", () => {
  it("accepts valid token", () => {
    const result = registerPushSchema.parse({ token: "ExponentPushToken[xxxx]" });
    expect(result.token).toBe("ExponentPushToken[xxxx]");
  });

  it("rejects empty token", () => {
    expect(() => registerPushSchema.parse({ token: "" })).toThrow();
  });

  it("rejects missing token", () => {
    expect(() => registerPushSchema.parse({})).toThrow();
  });
});
