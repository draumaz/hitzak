import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth-tokens";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Allow static files, assets, and auth-related paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/mascot.svg" ||
    pathname === "/ikurrina.svg" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Verify the session token
  const payload = token ? await verifyToken(token) : null;

  // 2. Redirect logged-in users away from /login or /signup to /
  if (pathname === "/login" || pathname === "/signup") {
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Redirect unauthenticated users to /login
  if (!payload) {
    // If it's an API route (e.g. /api/progress), return a JSON 401 response
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except _next/static, image optimization, and favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
