import { DecodedToken, AuthUser, UserRole } from "@/app/types/auth.type";
import { ClientCookies } from "./cookies";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key"; // Should match backend secret

/**
 * Decode JWT token and extract payload
 * Note: This is for client-side extraction only.
 * Backend should still validate the token signature.
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    return decoded as DecodedToken;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Extract user information from JWT token
 */
export function getUserFromToken(token: string): AuthUser | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
}

/**
 * Store JWT token in regular cookie with synchronized expiration
 */
export function storeToken(token: string): void {
  // Extract JWT expiration to sync with cookie
  const decoded = decodeJWT(token);
  const jwtExpiresIn = decoded
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 86400;

  ClientCookies.set(token, { maxAge: jwtExpiresIn });
}

/**
 * Retrieve JWT token from regular cookie
 */
export function getStoredToken(): string | null {
  return ClientCookies.get();
}

/**
 * Remove JWT token from regular cookie
 */
export function removeStoredToken(): void {
  ClientCookies.remove();
}

/**
 * Check if user has permission to access a route
 */
export function hasRoutePermission(userRole: UserRole, route: string): boolean {
  const permissions = {
    [UserRole.ADMIN]: [
      "/today",
      "/courses",
      "/students",
      "/teachers",
      "/parents",
      "/create-invoice",
      "/packages",
      "/invoices",
      "/receipts",
      "/schedule",
      "/notifications",
      "/management-fee",
      "/feedback",
      "/student",
      "/teacher",
      "/parent",
      "/invoice",
      "/enrollment",
    ],
    [UserRole.REGISTRAR]: [
      "/today",
      "/courses",
      "/students",
      "/teachers",
      "/parents",
      "/create-invoice",
      "/packages",
      "/invoices",
      "/receipts",
      "/schedule",
      "/notifications",
      "/feedback",
      "/student",
      "/teacher",
      "/parent",
      "/invoice",
      "/enrollment",
    ],
    [UserRole.TEACHER]: [
      "/today",
      "/courses",
      "/students",
      "/schedule",
      "/my-schedules",
    ],
  };

  return (
    permissions[userRole]?.some((allowedRoute) =>
      route.startsWith(allowedRoute)
    ) || false
  );
}

/**
 * Get redirect URL based on user role (default dashboard)
 */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/today";
    case UserRole.REGISTRAR:
      return "/today";
    case UserRole.TEACHER:
      return "/today";
    default:
      return "/today";
  }
}
