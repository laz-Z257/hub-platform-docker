import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  documento: string;
  rol: "user" | "asesor" | "admin" | "tecnico";
  tokenVersion: number;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  path: "/",
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: JwtPayload): string {
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.verify(token, secret) as JwtPayload;
}

export function setTokenCookies(
  res: import("express").Response,
  payload: JwtPayload
) {
  const token = signToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie("token", token, { ...COOKIE_OPTIONS, maxAge: 3600 * 1000 });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 3600 * 1000,
  });

  return { token, refreshToken };
}

export function clearTokenCookies(res: import("express").Response) {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
}
