import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MiddlewareCookies } from "./lib/cookies";
import { isTokenExpired } from "./lib/jwt";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/unauthorized",
  "/not-found",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (exact match or starts with route/)
  const isPublicRoute = pathname === "/" || PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = MiddlewareCookies.get(request);

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clear the expired cookie
    MiddlewareCookies.remove(response);
    return response;
  }

  // Token is valid, allow access
  // The client-side context handles detailed route permissions
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
