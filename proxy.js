// proxy.js — Route Protection by Role (Next.js 16)
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getRoleDashboardPath } from "@/lib/utils";

// Routes yang bisa diakses publik (tanpa login)
const PUBLIC_ROUTES = ["/login", "/wbs"];

// Role → allowed path prefixes
const ROLE_ALLOWED_PATHS = {
  AUDITOR:   ["/auditor", "/workspace"],
  KETUA_TIM: ["/auditor", "/review", "/workspace"],
  IRBAN:     ["/auditor", "/review", "/dalnis", "/irban", "/workspace"],
  ADMIN:     ["/auditor", "/review", "/dalnis", "/irban", "/admin", "/opd", "/bpkp", "/workspace"],
  OPD:       ["/opd"],
  BPKP:      ["/bpkp", "/auditor"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;

  // Izinkan public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Jika sudah login, redirect ke dashboard sesuai role
    if (session?.user) {
      return NextResponse.redirect(
        new URL(getRoleDashboardPath(session.user.role), req.url)
      );
    }
    return NextResponse.next();
  }

  // Belum login — redirect ke /login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cek akses berdasarkan role
  const allowedPaths = ROLE_ALLOWED_PATHS[session.user.role] || [];
  const hasAccess    = allowedPaths.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!hasAccess) {
    return NextResponse.redirect(
      new URL(getRoleDashboardPath(session.user.role), req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
