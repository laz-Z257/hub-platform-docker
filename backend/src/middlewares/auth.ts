import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { verifyToken, JwtPayload } from "../lib/jwt";
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

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.token;
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;

    db.select({ estado: users.estado })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)
      .then(([user]) => {
        if (user?.estado === "bloqueado") {
          res.status(403).json({ error: "Usuario bloqueado. No puedes realizar esta acción." });
          return;
        }

        db.update(users)
          .set({ ultima_actividad: new Date() })
          .where(eq(users.id, payload.userId))
          .execute()
          .catch(() => {});

        next();
      })
      .catch(() => {
        res.status(500).json({ error: "Error al verificar estado del usuario" });
      });
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
