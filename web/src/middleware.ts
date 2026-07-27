import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isUserLogin = pathname === "/user/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isUserArea = pathname.startsWith("/user");

  const adminToken = request.cookies.get("admin_token")?.value;
  const userToken = request.cookies.get("user_token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isAdminRole = userRole === "admin" || userRole === "tecnico";

  if (isDashboard && !adminToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserArea && !userToken && !isUserLogin) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  if (isLoginPage && adminToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isUserLogin && userToken) {
    return NextResponse.redirect(new URL("/user/chat", request.url));
  }

  if (isLoginPage && userToken && !isAdminRole) {
    return NextResponse.redirect(new URL("/user/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/user/:path*"],
};
