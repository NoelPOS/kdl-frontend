import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MiddlewareCookies } from "./lib/cookies";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/unauthorized",
  "/not-found",
];

// Routes that require authentication but are accessible to all roles
const PROTECTED_COMMON_ROUTES = [
  "/enrollment", // profile routes
  "/invoice",
  "/parent",
  "/student",
  "/teacher",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = MiddlewareCookies.get(request);

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For now, let the client-side context handle detailed route permissions
  // The middleware primarily handles authentication, not authorization
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
