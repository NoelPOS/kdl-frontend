import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/unauthorized",
  "/not-found",
  "/liff", // All LIFF routes are public (authenticated via LINE)
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

  // Check for HttpOnly auth cookie (set by backend)
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
