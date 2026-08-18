import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, sql, and, isNull } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { setTokenCookies, clearTokenCookies, verifyToken, extractToken, verifyRefreshToken, extractRefreshToken, detectRefreshScope, type AuthScope } from "../../lib/jwt";
import { getOrCreateCsrfToken } from "../../middlewares/csrf";
import { logger } from "../../lib/logger";
import { env } from "../../config/env";

const MAX_LOGIN_ATTEMPTS = env.MAX_LOGIN_ATTEMPTS;

// Hash de relleno para igualar timing cuando el usuario no existe (anti-enumeración)
const DUMMY_HASH = "$2a$12$xo2yWONym/BmrASiewX2luAQaaXLPGWevMtgLgJm3gbTrRajG5GNy";

// Minutos de bloqueo automático tras agotar intentos (bloqueo manual de admin = permanente)
const LOCKOUT_MINUTES = 15;

/**
 * Formatea la respuesta del usuario para el cliente
 * @param user - Usuario de la base de datos
 * @returns Objeto con datos públicos del usuario (sin contraseña)
 */
function userResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    documento: user.documento,
    nombre: user.nombre,
    rol: user.rol,
  };
}

/**
 * Registra un nuevo usuario en el sistema
 * - Valida que el documento no exista
 * - Hashea la contraseña con bcrypt (12 rondas)
 * - Genera email automático basado en documento
 * - Asigna rol "user" por defecto
 * 
 * @throws 409 - Si el documento ya está registrado
 * @throws 500 - Error interno del servidor
 */
export async function register(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { documento, nombre, contrasena } = req.body;

    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.documento, documento), isNull(users.deleted_at)))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "El documento ya está registrado" });
      return;
    }

    const hashed = await bcrypt.hash(contrasena, 12);

    const [user] = await db
      .insert(users)
      .values({
        documento,
        nombre,
        contrasena: hashed,
        email: `${documento}@${env.EMAIL_DOMAIN}`,
        rol: "user",
      })
      .returning();

    setTokenCookies(res, {
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
      tokenVersion: user.token_version,
    }, "user");

    const csrfToken = getOrCreateCsrfToken(req, res);

    res.status(201).json({ user: userResponse(user), csrfToken });
  } catch (error) {
    logger.error("Register error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

/**
 * Autentica un usuario y genera tokens JWT
 * - Valida documento y contraseña
 * - Bloquea usuario después de MAX_LOGIN_ATTEMPTS intentos fallidos
 * - Resetea contador de intentos al login exitoso
 * - Valida permisos según scope (admin/user)
 * - Genera cookies httpOnly con scope aislado
 * - Genera token CSRF
 * 
 * @throws 401 - Credenciales incorrectas
 * @throws 403 - Usuario bloqueado o sin permisos
 * @throws 500 - Error interno del servidor
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { documento, contrasena, scope } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.documento, documento), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      // Igualar timing con el caso de usuario existente (anti-enumeración)
      await bcrypt.compare(contrasena, DUMMY_HASH).catch(() => {});
      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    if (user.estado === "bloqueado") {
      // Auto-unlock: bloqueo por intentos fallidos (con fecha) expira solo
      if (user.bloqueado_hasta && user.bloqueado_hasta <= new Date()) {
        await db
          .update(users)
          .set({ estado: "activo", intentos_fallidos: 0, bloqueado_hasta: null })
          .where(and(eq(users.id, user.id), isNull(users.deleted_at)));
      } else {
        const msg = user.bloqueado_hasta
          ? `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo después de las ${user.bloqueado_hasta.toLocaleTimeString("es-CO", { timeZone: "America/Bogota" })}.`
          : "Usuario bloqueado. Contacta al administrador.";
        res.status(403).json({ error: msg });
        return;
      }
    }

    const valid = await bcrypt.compare(contrasena, user.contrasena);

    if (!valid) {
      const [updated] = await db
        .update(users)
        .set({ intentos_fallidos: sql`${users.intentos_fallidos} + 1` })
        .where(eq(users.id, user.id))
        .returning({ intentos_fallidos: users.intentos_fallidos });

      if ((updated?.intentos_fallidos ?? 0) >= MAX_LOGIN_ATTEMPTS) {
        await db
          .update(users)
          .set({
            estado: "bloqueado",
            bloqueado_hasta: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
          })
          .where(eq(users.id, user.id));
        res.status(403).json({
          error: `Cuenta bloqueada temporalmente por ${LOCKOUT_MINUTES} minutos tras múltiples intentos fallidos.`,
        });
        return;
      }

      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    await db
      .update(users)
      .set({ intentos_fallidos: 0 })
      .where(eq(users.id, user.id));

    // Validar rol según scope
    if (scope === "admin" && user.rol !== "admin" && user.rol !== "tecnico") {
      res.status(403).json({ error: "No tienes permisos para acceder al panel administrativo" });
      return;
    }

    const payload = {
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
      tokenVersion: user.token_version,
    };

    const tokens = setTokenCookies(res, payload, scope);

    const csrfToken = getOrCreateCsrfToken(req, res);

    res.json({ user: userResponse(user), token: tokens.token, csrfToken });
  } catch (error) {
    logger.error("Login error", { error: (error as Error).message });
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Obtiene el usuario autenticado actual
 * - Verifica token JWT del header/cookies
 * - Genera nuevo token CSRF
 * 
 * @throws 401 - Sesión inválida o token expirado
 * @throws 500 - Error interno del servidor
 */
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
      .where(and(eq(users.id, req.user!.userId), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Sesión inválida" });
      return;
    }

    const csrfToken = getOrCreateCsrfToken(req, res);

    res.json({ ...user, csrfToken });
  } catch (error) {
    logger.error("Me error", { error: (error as Error).message });
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Renueva el token JWT usando refresh token
 * - Extrae refresh token de cookies
 * - Verifica versión del token (invalidación)
 * - Genera nuevos tokens en el mismo scope
 * - Limpia todas las cookies si el refresh es inválido
 * 
 * @throws 401 - Refresh token inválido o versión mismatch
 * @throws 500 - Error interno del servidor
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  const scope = detectRefreshScope(req);

  try {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token no proporcionado" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    const [user] = await db
      .select({ token_version: users.token_version, estado: users.estado })
      .from(users)
      .where(and(eq(users.id, payload.userId), isNull(users.deleted_at)))
      .limit(1);

    if (!user || user.estado === "bloqueado" || user.token_version !== payload.tokenVersion) {
      // Solo limpiar cookies del scope — NO todas (sesiones aisladas)
      clearTokenCookies(res, scope);
      res.status(401).json({ error: "Sesión inválida, inicia sesión nuevamente" });
      return;
    }

    const tokens = setTokenCookies(res, {
      userId: payload.userId,
      documento: payload.documento,
      rol: payload.rol,
      tokenVersion: user.token_version,
    }, scope);

    const csrfToken = getOrCreateCsrfToken(req, res);

    res.json({ ok: true, token: tokens.token, csrfToken });
  } catch {
    // Solo limpiar cookies del scope — NO todas (sesiones aisladas)
    clearTokenCookies(res, scope);
    res.status(401).json({ error: "Sesión expirada, inicia sesión nuevamente" });
  }
}

/**
 * Cierra la sesión del usuario
 * - Detecta el scope (admin/user) desde header X-Auth-Scope
 * - Solo limpia las cookies del scope correspondiente
 * - NUNCA limpia cookies de otros scopes (sesiones aisladas)
 * 
 * Sesiones aisladas: logout en mobile no afecta dashboard y viceversa
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const headerScope = req.headers["x-auth-scope"];
  const scope: AuthScope | undefined = headerScope === "admin" || headerScope === "user" ? headerScope : undefined;

  // Invalidar todos los tokens del usuario incrementando token_version
  // (el logout limpia solo las cookies del scope, pero el bump invalida
  // cualquier token Bearer/refresh aún en circulación)
  try {
    let userId: string | undefined;
    const token = extractToken(req);
    if (token) {
      try {
        userId = verifyToken(token).userId;
      } catch {
        userId = undefined;
      }
    }
    if (!userId) {
      const refreshToken = extractRefreshToken(req);
      if (refreshToken) userId = verifyRefreshToken(refreshToken).userId;
    }
    if (userId) {
      await db
        .update(users)
        .set({ token_version: sql`${users.token_version} + 1` })
        .where(and(eq(users.id, userId), isNull(users.deleted_at)));
    }
  } catch (error) {
    logger.warn("Logout token invalidate failed", { error: (error as Error).message });
  }

  // Siempre limpiar solo las cookies del scope correspondiente
  // NUNCA clearAllTokenCookies — destruiría sesiones de otros scopes
  clearTokenCookies(res, scope);
  
  res.json({ ok: true });
}
