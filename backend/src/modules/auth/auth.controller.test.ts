import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { register, login, me, logout, refresh } from "./auth.controller";
import { db } from "../../db";
import { users } from "../../db/schema";
import bcrypt from "bcryptjs";
import * as jwt from "../../lib/jwt";
import * as csrf from "../../middlewares/csrf";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../../lib/jwt", () => ({
  setTokenCookies: vi.fn(),
  clearTokenCookies: vi.fn(),
  verifyToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  extractToken: vi.fn(),
  extractRefreshToken: vi.fn(),
  detectRefreshScope: vi.fn(),
  buildJwtPayload: vi.fn(
    (user: { id: string; documento: string; rol: string; token_version: number }, scope?: string) => ({
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
      tokenVersion: user.token_version,
      scope,
    })
  ),
  hashToken: vi.fn((t: string) => `hash-${t}`),
  refreshExpiry: vi.fn(() => new Date(Date.now() + 7 * 24 * 3600 * 1000)),
}));

vi.mock("../../middlewares/csrf", () => ({
  generateCsrfToken: vi.fn(),
  setCsrfCookie: vi.fn(),
  getOrCreateCsrfToken: vi.fn(),
}));

describe("Auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { body: {} };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: "user-id",
            documento: "123456789",
            nombre: "Test User",
            contrasena: "hashed",
            email: "123456789@hub.ai",
            rol: "user",
            token_version: 0,
          }]),
        }),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");
      (jwt.setTokenCookies as ReturnType<typeof vi.fn>).mockReturnValue({ token: "jwt-token" });
      (csrf.getOrCreateCsrfToken as ReturnType<typeof vi.fn>).mockReturnValue("csrf-token");

      req.body = {
        documento: "123456789",
        nombre: "Test User",
        contrasena: "password123",
      };

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        user: expect.objectContaining({
          documento: "123456789",
          nombre: "Test User",
          rol: "user",
        }),
        csrfToken: "csrf-token",
      });
    });

    it("should return 409 if document already exists", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing-user" }]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.body = {
        documento: "123456789",
        nombre: "Test User",
        contrasena: "password123",
      };

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "El documento ya está registrado",
      });
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-id",
        documento: "123456789",
        nombre: "Test User",
        contrasena: "hashed",
        email: "123456789@hub.ai",
        rol: "user",
        estado: "activo",
        token_version: 0,
        intentos_fallidos: 0,
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      (jwt.setTokenCookies as ReturnType<typeof vi.fn>).mockReturnValue({ token: "jwt-token" });
      (csrf.getOrCreateCsrfToken as ReturnType<typeof vi.fn>).mockReturnValue("csrf-token");

      req.body = {
        documento: "123456789",
        contrasena: "password123",
        scope: "user",
      };
      req.headers = { "x-auth-client": "mobile" };

      await login(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        user: expect.objectContaining({
          documento: "123456789",
          nombre: "Test User",
        }),
        token: "jwt-token",
        csrfToken: "csrf-token",
      });
    });

    it("should return 401 for invalid credentials", async () => {
      const mockUser = {
        id: "user-id",
        documento: "123456789",
        nombre: "Test User",
        contrasena: "hashed",
        estado: "activo",
        intentos_fallidos: 0,
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ intentos_fallidos: 1 }]),
          }),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      req.body = {
        documento: "123456789",
        contrasena: "wrongpassword",
      };

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Documento o contraseña incorrectos",
      });
    });

    it("should return 403 for blocked user", async () => {
      const mockUser = {
        id: "user-id",
        documento: "123456789",
        nombre: "Test User",
        contrasena: "hashed",
        estado: "bloqueado",
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.body = {
        documento: "123456789",
        contrasena: "password123",
      };

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuario bloqueado. Contacta al administrador.",
      });
    });

    it("should auto-unlock temp-blocked user when lockout expired", async () => {
      const mockUser = {
        id: "user-id",
        documento: "123456789",
        nombre: "Test User",
        contrasena: "hashed",
        estado: "bloqueado",
        bloqueado_hasta: new Date(Date.now() - 60 * 1000), // expiró hace 1 min
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      req.body = {
        documento: "123456789",
        contrasena: "password123",
      };

      await login(req as Request, res as Response);

      // Desbloquea y deja continuar el login
      expect(db.update).toHaveBeenCalledWith(users);
      expect(jsonMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("bloqueada") })
      );
    });

    it("should reject temp-blocked user while lockout is active", async () => {
      const mockUser = {
        id: "user-id",
        documento: "123456789",
        nombre: "Test User",
        contrasena: "hashed",
        estado: "bloqueado",
        bloqueado_hasta: new Date(Date.now() + 10 * 60 * 1000), // falta 10 min
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.body = {
        documento: "123456789",
        contrasena: "password123",
      };

      await login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: expect.stringContaining("bloqueada temporalmente"),
      });
    });
  });

  describe("logout", () => {
    it("should clear cookies for the correct scope", async () => {
      req.headers = { "x-auth-scope": "user" };

      await logout(req as Request, res as Response);

      expect(jwt.clearTokenCookies).toHaveBeenCalledWith(res, "user", undefined);
      expect(jsonMock).toHaveBeenCalledWith({ ok: true });
    });

    it("should bump only the scope version (isolated logout)", async () => {
      req.headers = { "x-auth-scope": "user" };
      (jwt.extractToken as ReturnType<typeof vi.fn>).mockReturnValue("access-token");
      (jwt.verifyToken as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: "user-id",
        tokenVersion: 0,
        scope: "user",
        scopeVersion: 0,
      });

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      await logout(req as Request, res as Response);

      // 1) revoca refresh tokens del scope, 2) bumpea token_version_user
      expect(db.update).toHaveBeenCalledTimes(2);
      expect(updateChain.set).toHaveBeenCalledWith({ token_version_user: expect.anything() });
      expect(updateChain.set).not.toHaveBeenCalledWith({ token_version: expect.anything() });
      expect(jwt.clearTokenCookies).toHaveBeenCalledWith(res, "user", undefined);
    });

    it("should bump global version when scope is unknown", async () => {
      req.headers = {};
      (jwt.extractToken as ReturnType<typeof vi.fn>).mockReturnValue("access-token");
      (jwt.verifyToken as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: "user-id",
        tokenVersion: 0,
      });

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      await logout(req as Request, res as Response);

      expect(updateChain.set).toHaveBeenCalledWith({ token_version: expect.anything() });
    });
  });

  describe("refresh", () => {
    const mockUser = {
      id: "user-id",
      documento: "123456789",
      rol: "user",
      estado: "activo",
      token_version: 0,
      token_version_admin: 0,
      token_version_user: 0,
    };

    function mockSelectUser(user: typeof mockUser) {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([user]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);
    }

    beforeEach(() => {
      (jwt.detectRefreshScope as ReturnType<typeof vi.fn>).mockReturnValue("user");
      (jwt.extractRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue("refresh-token");
    });

    it("should rotate the refresh token and issue new cookies", async () => {
      (jwt.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: "user-id",
        documento: "123456789",
        rol: "user",
        tokenVersion: 0,
        scope: "user",
        scopeVersion: 0,
        jti: "jti-1",
      });
      mockSelectUser(mockUser);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ expires_at: new Date(Date.now() + 86400000) }]),
          }),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      const insertChain = {
        values: vi.fn().mockResolvedValue(undefined),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      const deleteChain = {
        where: vi.fn().mockResolvedValue(undefined),
      };
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(deleteChain);

      (jwt.setTokenCookies as ReturnType<typeof vi.fn>).mockReturnValue({
        token: "new-access",
        refreshToken: "new-refresh",
        refreshJti: "jti-2",
      });
      (csrf.getOrCreateCsrfToken as ReturnType<typeof vi.fn>).mockReturnValue("csrf-token");
      req.headers = { "x-auth-client": "mobile" };

      await refresh(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({ ok: true, token: "new-access", csrfToken: "csrf-token" });
      // La nueva sesión se persiste con el jti nuevo
      expect(insertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ id: "jti-2", user_id: "user-id", scope: "user" })
      );
    });

    it("should revoke all sessions on refresh token reuse", async () => {
      (jwt.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: "user-id",
        documento: "123456789",
        rol: "user",
        tokenVersion: 0,
        scope: "user",
        scopeVersion: 0,
        jti: "jti-1",
      });
      mockSelectUser(mockUser);

      // La rotación no reclama ninguna fila: el jti ya estaba revocado (reuso)
      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      await refresh(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jwt.clearTokenCookies).toHaveBeenCalledWith(res, "user", undefined);
      // Revoca todas las sesiones + bumpea versión global
      expect(db.update).toHaveBeenCalledTimes(3);
    });

    it("should reject expired refresh session without nuking others", async () => {
      (jwt.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: "user-id",
        documento: "123456789",
        rol: "user",
        tokenVersion: 0,
        scope: "user",
        scopeVersion: 0,
        jti: "jti-1",
      });
      mockSelectUser(mockUser);

      const updateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ expires_at: new Date(Date.now() - 1000) }]),
          }),
        }),
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);

      await refresh(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jwt.clearTokenCookies).toHaveBeenCalledWith(res, "user", undefined);
      // Solo la rotación (claim); sin revocación masiva
      expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when no refresh token is provided", async () => {
      (jwt.extractRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

      await refresh(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});
