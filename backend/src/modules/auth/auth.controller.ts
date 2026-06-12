import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { setTokenCookies, clearTokenCookies, verifyToken, verifyRefreshToken } from "../../lib/jwt";
import { generateCsrfToken, setCsrfCookie } from "../../middlewares/csrf";

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10);

function userResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    documento: user.documento,
    nombre: user.nombre,
    rol: user.rol,
  };
}

export async function register(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { documento, nombre, contrasena } = req.body;

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.documento, documento))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "El documento ya está registrado" });
      return;
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const [user] = await db
      .insert(users)
      .values({
        documento,
        nombre,
        contrasena: hashed,
        email: `${documento}@hub.ai`,
        rol: "user",
      })
      .returning();

    setTokenCookies(res, {
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
      tokenVersion: user.token_version,
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.status(201).json({ user: userResponse(user), csrfToken });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { documento, contrasena } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.documento, documento))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    if (user.estado === "bloqueado") {
      res.status(403).json({ error: "Usuario bloqueado por múltiples intentos fallidos. Contacta al administrador." });
      return;
    }

    const valid = await bcrypt.compare(contrasena, user.contrasena);

    if (!valid) {
      const newCount = (user.intentos_fallidos || 0) + 1;

      if (newCount >= MAX_LOGIN_ATTEMPTS) {
        await db
          .update(users)
          .set({ intentos_fallidos: newCount, estado: "bloqueado" })
          .where(eq(users.id, user.id));
        res.status(403).json({ error: `Usuario bloqueado por múltiples intentos fallidos. Contacta al administrador.` });
        return;
      }

      await db
        .update(users)
        .set({ intentos_fallidos: newCount })
        .where(eq(users.id, user.id));

      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    await db
      .update(users)
      .set({ intentos_fallidos: 0 })
      .where(eq(users.id, user.id));

    const payload = {
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
      tokenVersion: user.token_version,
    };

    const { token } = setTokenCookies(res, payload);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({ token, user: userResponse(user), csrfToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const [user] = await db
      .select({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        rol: users.rol,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({ ...user, csrfToken });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token no proporcionado" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    const [user] = await db
      .select({ token_version: users.token_version })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.token_version !== payload.tokenVersion) {
      clearTokenCookies(res);
      res.status(401).json({ error: "Sesión inválida, inicia sesión nuevamente" });
      return;
    }

    setTokenCookies(res, {
      userId: payload.userId,
      documento: payload.documento,
      rol: payload.rol,
      tokenVersion: user.token_version,
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({ ok: true, csrfToken });
  } catch {
    clearTokenCookies(res);
    res.status(401).json({ error: "Sesión expirada, inicia sesión nuevamente" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const cookieToken = req.cookies?.token;
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = cookieToken || headerToken;

    if (token) {
      const payload = verifyToken(token);
      db.update(users)
        .set({ token_version: sql`token_version + 1` })
        .where(eq(users.id, payload.userId))
        .execute()
        .catch(() => {});
    }
  } catch {
    // Token invalid/expired — still clear cookies
  }
  clearTokenCookies(res);
  res.json({ ok: true });
}
