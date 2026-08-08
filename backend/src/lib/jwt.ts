import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  documento: string;
  rol: "user" | "asesor" | "admin" | "tecnico";
  tokenVersion: number;
}

export type AuthScope = "admin" | "user";

const SCOPE_ORDER: (AuthScope | undefined)[] = ["admin", "user", undefined];

function getCookieName(base: string, scope?: AuthScope): string {
  if (scope === "admin") return `admin_${base}`;
  if (scope === "user") return `user_${base}`;
  return base;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function setTokenCookies(
  res: import("express").Response,
  payload: JwtPayload,
  scope?: AuthScope
) {
  const token = signToken(payload);
  const refreshToken = signRefreshToken(payload);

  const isSecure = res.req.protocol === "https";
  const path = "/";
  const tokenName = getCookieName("token", scope);
  const refreshName = getCookieName("refreshToken", scope);

  const opts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    path,
  };

  res.cookie(tokenName, token, { ...opts, maxAge: 3600 * 1000 });
  res.cookie(refreshName, refreshToken, {
    ...opts,
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.cookie(getCookieName("userRole", scope), payload.rol, {
    httpOnly: false,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    path,
    maxAge: 3600 * 1000,
  });

  return { token, refreshToken };
}

export function clearTokenCookies(
  res: import("express").Response,
  scope?: AuthScope
) {
  const path = "/";
  const tokenName = getCookieName("token", scope);
  const refreshName = getCookieName("refreshToken", scope);

  res.clearCookie(tokenName, { path });
  res.clearCookie(refreshName, { path });
  res.clearCookie(getCookieName("userRole", scope), { path });
  res.clearCookie("userRole", { path });
}

function getScopeFromHeader(req: import("express").Request): AuthScope | undefined {
  const headerScope = req.headers["x-auth-scope"];
  if (headerScope === "admin" || headerScope === "user") return headerScope;
  return undefined;
}

export function extractToken(req: import("express").Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);

  const headerScope = getScopeFromHeader(req);
  if (headerScope) {
    const name = getCookieName("token", headerScope);
    const cookie = req.cookies?.[name];
    if (cookie) return cookie;
  }

  for (const s of SCOPE_ORDER) {
    const name = getCookieName("token", s);
    const cookie = req.cookies?.[name];
    if (cookie) return cookie;
  }
  return null;
}

export function extractRefreshToken(req: import("express").Request): string | null {
  const headerScope = getScopeFromHeader(req);
  if (headerScope) {
    const name = getCookieName("refreshToken", headerScope);
    const cookie = req.cookies?.[name];
    if (cookie) return cookie;
  }

  for (const s of SCOPE_ORDER) {
    const name = getCookieName("refreshToken", s);
    const cookie = req.cookies?.[name];
    if (cookie) return cookie;
  }
  return null;
}

export function detectRefreshScope(req: import("express").Request): AuthScope | undefined {
  const headerScope = getScopeFromHeader(req);
  if (headerScope) return headerScope;

  for (const s of SCOPE_ORDER) {
    const name = getCookieName("refreshToken", s);
    if (req.cookies?.[name]) return s;
  }
  return undefined;
}
