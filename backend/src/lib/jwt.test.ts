import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./jwt";

const TEST_SECRET = "vitest-jwt-secret-key";
const TEST_REFRESH_SECRET = "vitest-jwt-refresh-secret-key";

vi.mock("../config/env", () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    JWT_REFRESH_SECRET: TEST_REFRESH_SECRET,
    NODE_ENV: "test",
  },
}));

let signToken: (payload: JwtPayload) => string;
let signRefreshToken: (payload: JwtPayload) => string;
let verifyToken: (token: string) => JwtPayload;
let verifyRefreshToken: (token: string) => JwtPayload;

beforeAll(async () => {
  const mod = await import("./jwt");
  signToken = mod.signToken;
  signRefreshToken = mod.signRefreshToken;
  verifyToken = mod.verifyToken;
  verifyRefreshToken = mod.verifyRefreshToken;
});

const TEST_PAYLOAD: JwtPayload = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  documento: "12345678",
  rol: "user",
  tokenVersion: 1,
};

describe("signToken", () => {
  it("returns a JWT string", () => {
    const token = signToken(TEST_PAYLOAD);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("contains the payload data", () => {
    const token = signToken(TEST_PAYLOAD);
    const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;
    expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
    expect(decoded.documento).toBe(TEST_PAYLOAD.documento);
    expect(decoded.rol).toBe(TEST_PAYLOAD.rol);
    expect(decoded.tokenVersion).toBe(TEST_PAYLOAD.tokenVersion);
  });
});

describe("signRefreshToken", () => {
  it("returns a JWT string", () => {
    const token = signRefreshToken(TEST_PAYLOAD);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  it("returns the payload for a valid token", () => {
    const token = signToken(TEST_PAYLOAD);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
    expect(decoded.documento).toBe(TEST_PAYLOAD.documento);
    expect(decoded.rol).toBe(TEST_PAYLOAD.rol);
    expect(decoded.tokenVersion).toBe(TEST_PAYLOAD.tokenVersion);
  });

  it("throws for an invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });

  it("throws for a token signed with a different secret", () => {
    const token = jwt.sign(TEST_PAYLOAD, "wrong-secret");
    expect(() => verifyToken(token)).toThrow();
  });

  it("throws for an expired token", () => {
    const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: "0s" });
    expect(() => verifyToken(token)).toThrow();
  });
});

describe("verifyRefreshToken", () => {
  it("returns the payload for a valid refresh token", () => {
    const token = signRefreshToken(TEST_PAYLOAD);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
  });

  it("throws for an invalid refresh token", () => {
    expect(() => verifyRefreshToken("invalid-token")).toThrow();
  });
});
