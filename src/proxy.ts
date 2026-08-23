import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  const isAdminLoginRoute = pathname === "/admin/login";
  if (pathname.startsWith("/admin") && !isAdminLoginRoute) {
    if (session?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  if (isAdminLoginRoute && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  const isLoginRoute = pathname === "/giris";
  if (pathname.startsWith("/danisan") && session?.role !== "danisan") {
    return NextResponse.redirect(new URL("/giris", request.url));
  }
  if (pathname.startsWith("/psikolog") && session?.role !== "psikolog") {
    return NextResponse.redirect(new URL("/giris", request.url));
  }
  if (pathname.startsWith("/gorusme") && !session) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }
  if (isLoginRoute && session) {
    if (session.role === "danisan") {
      return NextResponse.redirect(new URL("/danisan/randevularim", request.url));
    }
    if (session.role === "psikolog") {
      return NextResponse.redirect(new URL("/psikolog/panel", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/danisan/:path*",
    "/psikolog/:path*",
    "/gorusme/:path*",
    "/giris",
  ],
};
