import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { setTokenCookies, clearTokenCookies, verifyToken, signToken } from "../../lib/jwt";

function userResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    documento: user.documento,
    nombre: user.nombre,
    email: user.email,
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
    });

    res.status(201).json({ user: userResponse(user) });
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
      res.status(403).json({ error: "Usuario bloqueado. Contacta al administrador." });
      return;
    }

    const valid = await bcrypt.compare(contrasena, user.contrasena);

    if (!valid) {
      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    const payload = {
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
    };

    const { token } = setTokenCookies(res, payload);

    res.json({ token, user: userResponse(user) });
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

    res.json(user);
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

    const payload = verifyToken(refreshToken);

    setTokenCookies(res, {
      userId: payload.userId,
      documento: payload.documento,
      rol: payload.rol,
    });

    res.json({ ok: true });
  } catch {
    clearTokenCookies(res);
    res.status(401).json({ error: "Sesión expirada, inicia sesión nuevamente" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearTokenCookies(res);
  res.json({ ok: true });
}
