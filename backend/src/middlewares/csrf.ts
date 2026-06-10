import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

const COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  path: "/",
};

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function setCsrfCookie(res: Response, token: string) {
  res.cookie(CSRF_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 3600 * 1000 });
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Mobile / Bearer token clients: CSRF not applicable
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }

  // Auth endpoints don't need CSRF (login/register/refresh have no prior session)
  if (req.path.startsWith("/api/auth")) {
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
