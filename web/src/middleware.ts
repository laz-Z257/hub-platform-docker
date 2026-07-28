import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isUserLogin = pathname === "/user/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isUserArea = pathname.startsWith("/user");

  const adminToken = request.cookies.get("admin_token")?.value;
  const userToken = request.cookies.get("user_token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const adminValid = isTokenValid(adminToken);
  const userValid = isTokenValid(userToken);
  const isAdminRole = userRole === "admin" || userRole === "tecnico";

  if (isDashboard && !adminValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserArea && !userValid && !isUserLogin) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  if (isLoginPage && adminValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isUserLogin && userValid) {
    return NextResponse.redirect(new URL("/user/chat", request.url));
  }

  if (isLoginPage && userValid && !isAdminRole) {
    return NextResponse.redirect(new URL("/user/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/user/:path*"],
};