import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { register, login, me, logout } from "./auth.controller";
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
          where: vi.fn().mockResolvedValue(undefined),
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
        error: "Usuario bloqueado por múltiples intentos fallidos. Contacta al administrador.",
      });
    });
  });

  describe("logout", () => {
    it("should clear cookies for the correct scope", async () => {
      req.headers = { "x-auth-scope": "user" };

      await logout(req as Request, res as Response);

      expect(jwt.clearTokenCookies).toHaveBeenCalledWith(res, "user");
      expect(jsonMock).toHaveBeenCalledWith({ ok: true });
    });
  });
});
