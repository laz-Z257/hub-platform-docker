import { Request, Response, NextFunction } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { verifyToken, JwtPayload, extractToken } from "../lib/jwt";
import { db } from "../db";
import { users } from "../db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      cookies: Record<string, string | undefined>;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;

    const [user] = await db
      .select({
        estado: users.estado,
        ultima_actividad: users.ultima_actividad,
        token_version: users.token_version,
        bloqueado_hasta: users.bloqueado_hasta,
        id: users.id,
      })
      .from(users)
      .where(and(eq(users.id, payload.userId), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    if (user.estado === "bloqueado") {
      // Auto-unlock: bloqueo por intentos fallidos (con fecha) expira solo;
      // bloqueo manual de admin (sin fecha) sigue permanente
      if (user.bloqueado_hasta && user.bloqueado_hasta <= new Date()) {
        // Guard CAS: solo desbloquea si sigue bloqueado por lockout temporal
        // (evita pisar un bloqueo manual concurrente) y no está soft-deleted
        await db
          .update(users)
          .set({ estado: "activo", intentos_fallidos: 0, bloqueado_hasta: null })
          .where(
            and(
              eq(users.id, user.id),
              eq(users.estado, "bloqueado"),
              isNull(users.deleted_at)
            )
          );
      } else {
        res.status(403).json({ error: "Usuario bloqueado. No puedes realizar esta acción." });
        return;
      }
    }

    // Validar versión del token (invalidación tras logout)
    if (user.token_version !== payload.tokenVersion) {
      res.status(401).json({ error: "Sesión expirada, inicia sesión nuevamente" });
      return;
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!user.ultima_actividad || user.ultima_actividad < fiveMinutesAgo) {
      await db
        .update(users)
        .set({ ultima_actividad: new Date() })
        .where(eq(users.id, payload.userId));
    }

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expirado" });
      return;
    }
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
