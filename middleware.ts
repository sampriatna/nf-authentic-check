import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow login page without auth
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for admin session cookie on protected routes
    const adminSession = request.cookies.get("nf_admin_session");
    if (!adminSession || adminSession.value !== "active") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
