import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function setCsrfCookie(res: Response, token: string) {
  const isSecure = res.req.protocol === "https";
  const opts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" as const : "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 3600 * 1000,
  };
  res.cookie(CSRF_COOKIE, token, opts);
}

export function getOrCreateCsrfToken(req: Request, res: Response): string {
  const existing = req.cookies?.[CSRF_COOKIE];
  if (typeof existing === "string" && existing.length >= 32) {
    return existing;
  }
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  return token;
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }

  // Login/registro: aún no hay sesión ni token CSRF disponible.
  // Refresh: protegido por cookies httpOnly sameSite; rotar la sesión del
  // propio usuario no beneficia a un atacante (no entrega nada) y el cliente
  // puede necesitarlo justo tras un reload, cuando aún no tiene token CSRF
  // en memoria (la cookie es httpOnly e ilegible para JS).
  if (
    ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"].includes(
      req.path
    )
  ) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: "CSRF token inválido" });
    return;
  }

  next();
}
