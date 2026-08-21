import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./jwt";

const TEST_SECRET = "vitest-jwt-secret-key";
const TEST_REFRESH_SECRET = "vitest-jwt-refresh-secret-key";

vi.mock("../config/env", () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    JWT_REFRESH_SECRET: TEST_REFRESH_SECRET,
    JWT_EXPIRES_IN: "1h",
    NODE_ENV: "test",
  },
}));

let signToken: (payload: JwtPayload) => string;
let verifyToken: (token: string) => JwtPayload;
let verifyRefreshToken: (token: string) => JwtPayload;
let signRefreshToken: (payload: JwtPayload) => { token: string; jti: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractToken: (req: any) => string | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractRefreshToken: (req: any) => string | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detectRefreshScope: (req: any) => "admin" | "user" | undefined;

beforeAll(async () => {
  const mod = await import("./jwt");
  signToken = mod.signToken;
  signRefreshToken = mod.signRefreshToken;
  verifyToken = mod.verifyToken;
  verifyRefreshToken = mod.verifyRefreshToken;
  extractToken = mod.extractToken;
  extractRefreshToken = mod.extractRefreshToken;
  detectRefreshScope = mod.detectRefreshScope;
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
  it("returns a JWT string with a unique jti", () => {
    const { token, jti } = signRefreshToken(TEST_PAYLOAD);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    expect(jti).toMatch(/^[0-9a-f-]{36}$/i);

    const second = signRefreshToken(TEST_PAYLOAD);
    expect(second.jti).not.toBe(jti);
  });

  it("embeds the jti in the token payload", () => {
    const { token, jti } = signRefreshToken(TEST_PAYLOAD);
    const decoded = jwt.verify(token, TEST_REFRESH_SECRET) as Record<string, unknown>;
    expect(decoded.jti).toBe(jti);
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
    const { token } = signRefreshToken(TEST_PAYLOAD);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
    expect(decoded.jti).toBeTruthy();
  });

  it("throws for an invalid refresh token", () => {
    expect(() => verifyRefreshToken("invalid-token")).toThrow();
  });
});

// Aislamiento de sesiones: el navegador NO distingue puertos (localhost:3000
// web y localhost:8081 PWA comparten cookies), así que una cookie de un scope
// NUNCA debe autenticar un request de otro scope/cliente.
describe("aislamiento de cookies por scope/cliente", () => {
  const COOKIES_TODOS = {
    admin_token: "admin-access",
    user_token: "pwa-access",
    mobile_token: "mobile-access",
    admin_refreshToken: "admin-refresh",
    user_refreshToken: "web-user-refresh",
    mobile_refreshToken: "mobile-refresh",
    token: "legacy-access",
    refreshToken: "legacy-refresh",
  };

  function req(headers: Record<string, string> = {}, cookies: Record<string, string> = COOKIES_TODOS) {
    return { headers, cookies };
  }

  describe("extractToken", () => {
    it("Bearer tiene prioridad absoluta", () => {
      expect(extractToken(req({ authorization: "Bearer bearer-token" }))).toBe("bearer-token");
    });

    it("scope admin lee SOLO admin_token", () => {
      expect(extractToken(req({ "x-auth-scope": "admin" }))).toBe("admin-access");
    });

    it("scope user (web) lee SOLO user_token, no la de mobile", () => {
      expect(extractToken(req({ "x-auth-scope": "user" }))).toBe("pwa-access");
    });

    it("scope user + cliente mobile lee SOLO mobile_token", () => {
      expect(extractToken(req({ "x-auth-scope": "user", "x-auth-client": "mobile" }))).toBe("mobile-access");
    });

    it("sin scope ni Bearer: SOLO cookie legacy, nunca escanea scopes", () => {
      // La sesión de la PWA (user_token/mobile_token) NO puede terminar
      // autenticando un request del dashboard sin header
      expect(extractToken(req({}))).toBe("legacy-access");
    });

    it("sin scope y sin cookie legacy: null aunque existan cookies de scopes", () => {
      expect(extractToken(req({}, { user_token: "pwa", admin_token: "admin" }))).toBeNull();
    });

    it("scope declarado sin su cookie: null aunque existan cookies de otros scopes", () => {
      expect(extractToken(req({ "x-auth-scope": "admin" }, { user_token: "pwa" }))).toBeNull();
    });
  });

  describe("extractRefreshToken", () => {
    it("scope admin lee SOLO admin_refreshToken", () => {
      expect(extractRefreshToken(req({ "x-auth-scope": "admin" }))).toBe("admin-refresh");
    });

    it("scope user (web) lee user_refreshToken, no la de mobile", () => {
      expect(extractRefreshToken(req({ "x-auth-scope": "user" }))).toBe("web-user-refresh");
    });

    it("cliente mobile lee SOLO mobile_refreshToken", () => {
      expect(extractRefreshToken(req({ "x-auth-scope": "user", "x-auth-client": "mobile" }))).toBe("mobile-refresh");
    });

    it("sin scope: SOLO cookie legacy", () => {
      expect(extractRefreshToken(req({}))).toBe("legacy-refresh");
    });
  });

  describe("detectRefreshScope", () => {
    it("usa el header cuando está presente", () => {
      expect(detectRefreshScope(req({ "x-auth-scope": "admin" }))).toBe("admin");
      expect(detectRefreshScope(req({ "x-auth-scope": "user" }))).toBe("user");
    });

    it("sin header: undefined aunque existan cookies de scopes", () => {
      expect(detectRefreshScope(req({}))).toBeUndefined();
    });
  });
});
