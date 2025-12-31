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

  // Check for HttpOnly auth cookie (EC2 production)
  const cookieToken = request.cookies.get("accessToken")?.value;
  
  // On Vercel, tokens are in localStorage (client-side only)
  // We can't check localStorage in middleware, so we check for a marker cookie
  // that indicates the user has logged in (set by client after login)
  const isVercelAuth = request.cookies.get("authMode")?.value === "header";

  // Allow access if:
  // 1. Has HttpOnly cookie (EC2), OR
  // 2. Has authMode marker (Vercel - actual token validation happens client-side)
  if (!cookieToken && !isVercelAuth) {
    // No auth evidence - redirect to login
    // But on Vercel, this might cause issues for first-time page loads
    // Let the client-side auth context handle the redirect instead
    const isVercelEnvironment = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    
    if (isVercelEnvironment) {
      // On Vercel: Let client-side handle auth (localStorage check)
      // Pass through and let AuthContext redirect if needed
      return NextResponse.next();
    }
    
    // On EC2: Strict cookie check
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
