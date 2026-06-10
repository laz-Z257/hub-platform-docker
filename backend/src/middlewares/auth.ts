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
  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (err) {
      console.error("optionalAuth: token verification failed", err);
    }
  }

  next();
}
