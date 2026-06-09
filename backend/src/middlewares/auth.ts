import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { db } from "../db";
import { users } from "../db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);

    db.update(users)
      .set({ ultima_actividad: new Date() })
      .where(eq(users.id, req.user.userId))
      .execute()
      .catch(() => {});

    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.slice(7);
      req.user = verifyToken(token);
    } catch (err) {
      console.error("optionalAuth: token verification failed", err);
    }
  }

  next();
}
