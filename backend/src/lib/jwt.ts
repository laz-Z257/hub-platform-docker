import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "crypto";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  documento: string;
  rol: "user" | "asesor" | "admin" | "tecnico";
  tokenVersion: number;
  /** Scope al que pertenece la sesión ("admin" = dashboard, "user" = mobile) */
  scope?: AuthScope;
  /** Versión del token específica del scope (logout aislado) */
  scopeVersion?: number;
  /** ID de la fila en refresh_tokens (solo refresh tokens) */
  jti?: string;
}

export type AuthScope = "admin" | "user";

/** Cliente que origina la sesión: la PWA mobile usa cookies propias (mobile_*) */
export type AuthClient = "mobile" | undefined;

const REFRESH_TTL_MS = 7 * 24 * 3600 * 1000;

function getCookieName(base: string, scope?: AuthScope, client?: AuthClient): string {
  if (client === "mobile") return `mobile_${base}`;
  if (scope === "admin") return `admin_${base}`;
  if (scope === "user") return `user_${base}`;
  return base;
}

function getScopeFromHeader(req: import("express").Request): AuthScope | undefined {
  const headerScope = req.headers["x-auth-scope"];
  if (headerScope === "admin" || headerScope === "user") return headerScope;
  return undefined;
}

function getClientFromHeader(req: import("express").Request): AuthClient {
  return req.headers["x-auth-client"] === "mobile" ? "mobile" : undefined;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: JwtPayload): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, jti }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { token, jti };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

/** Hash determinista del refresh token para persistirlo sin guardarlo en claro */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshExpiry(): Date {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

/**
 * Construye el payload del JWT con los datos de versión por scope.
 * Los tokens sin scope (legacy) solo llevan la versión global.
 */
export function buildJwtPayload(
  user: {
    id: string;
    documento: string;
    rol: JwtPayload["rol"];
    token_version: number;
    token_version_admin: number;
    token_version_user: number;
  },
  scope?: AuthScope
): JwtPayload {
  const payload: JwtPayload = {
    userId: user.id,
    documento: user.documento,
    rol: user.rol,
    tokenVersion: user.token_version,
  };
  if (scope) {
    payload.scope = scope;
    payload.scopeVersion =
      scope === "admin" ? user.token_version_admin : user.token_version_user;
  }
  return payload;
}

/** Max-age de cookie para que venza junto con el access token */
function tokenMaxAge(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (decoded?.exp) {
    const ms = decoded.exp * 1000 - Date.now();
    if (ms > 0) return ms;
  }
  return 3600 * 1000;
}

export function setTokenCookies(
  res: import("express").Response,
  payload: JwtPayload,
  scope?: AuthScope,
  client?: AuthClient
) {
  const token = signToken(payload);
  const { token: refreshToken, jti } = signRefreshToken(payload);

  const isSecure = res.req.protocol === "https";
  const path = "/";
  const tokenName = getCookieName("token", scope, client);
  const refreshName = getCookieName("refreshToken", scope, client);

  const opts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    path,
  };

  res.cookie(tokenName, token, {
    ...opts,
    // Sincronizar cookie con el exp real del JWT (JWT_EXPIRES_IN configurable)
    maxAge: tokenMaxAge(token),
  });
  res.cookie(refreshName, refreshToken, {
    ...opts,
    maxAge: REFRESH_TTL_MS,
  });

  return { token, refreshToken, refreshJti: jti };
}

export function clearTokenCookies(
  res: import("express").Response,
  scope?: AuthScope,
  client?: AuthClient
) {
  const isSecure = res.req.protocol === "https";
  const opts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    path: "/",
  };
  res.clearCookie(getCookieName("token", scope, client), opts);
  res.clearCookie(getCookieName("refreshToken", scope, client), opts);
  res.clearCookie(getCookieName("userRole", scope, client), opts);
}

/**
 * Extrae el access token: Bearer → cookie del scope/cliente EXPLÍCITO →
 * cookie legacy sin scope.
 *
 * NUNCA escanear cookies de otros scopes/clientes: el navegador no distingue
 * puertos (localhost:3000 y localhost:8081 comparten cookies), así que un
 * fallback escaneando haría que la sesión de la PWA (user_token) termine
 * autenticando requests del dashboard y viceversa.
 */
export function extractToken(req: import("express").Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);

  const headerScope = getScopeFromHeader(req);
  if (headerScope) {
    const name = getCookieName("token", headerScope, getClientFromHeader(req));
    return req.cookies?.[name] ?? null;
  }

  // Legacy: solo la cookie sin scope
  return req.cookies?.["token"] ?? null;
}

/** Igual que extractToken pero para el refresh token (cookie httpOnly) */
export function extractRefreshToken(req: import("express").Request): string | null {
  const headerScope = getScopeFromHeader(req);
  if (headerScope) {
    const name = getCookieName("refreshToken", headerScope, getClientFromHeader(req));
    return req.cookies?.[name] ?? null;
  }

  // Legacy: solo la cookie sin scope
  return req.cookies?.["refreshToken"] ?? null;
}

export function detectRefreshScope(req: import("express").Request): AuthScope | undefined {
  return getScopeFromHeader(req);
}
