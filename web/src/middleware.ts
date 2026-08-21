import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

interface TokenPayload {
  rol?: unknown;
}

async function verifyToken(
  token: string | undefined
): Promise<TokenPayload | null> {
  if (!token || !JWT_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return typeof payload === "object" && payload !== null
      ? (payload as TokenPayload)
      : null;
  } catch {
    return null;
  }
}

function isAdminRol(rol: unknown): boolean {
  return rol === "admin" || rol === "tecnico";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!JWT_SECRET) {
    console.error("[middleware] JWT_SECRET no está definido: las rutas protegidas están bloqueadas (fail-closed). Configura la variable en el entorno del servicio web.");
  }

  const isUserLogin = pathname === "/user/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isUserArea = pathname.startsWith("/user");

  const adminToken = request.cookies.get("admin_token")?.value;
  const userToken = request.cookies.get("user_token")?.value;

  const [adminPayload, userPayload] = await Promise.all([
    verifyToken(adminToken),
    verifyToken(userToken),
  ]);

  const adminValid = adminPayload !== null;
  const userValid = userPayload !== null;

  // Dashboard exige token admin válido Y rol administrativo en el payload
  // (defensa en profundidad: un user_token copiado a la cookie admin_ no pasa)
  if (isDashboard && (!adminValid || !isAdminRol(adminPayload?.rol))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserArea && !userValid && !isUserLogin) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  // NOTA: no redirigir /login → /dashboard ni /user/login → /user/chat.
  // El middleware solo verifica la FIRMA del JWT: no puede validar
  // token_version/scopeVersion contra la BD. Una cookie con firma válida
  // pero sesión invalidada (logout en otro dispositivo, bloqueo, reset de
  // password, bump de versión) provocaba el bucle infinito
  // /login → /dashboard → 401 → /login … y el usuario nunca veía el
  // formulario. El login siempre debe ser accesible para re-autenticarse.

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/user/:path*"],
};
