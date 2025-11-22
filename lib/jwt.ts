import {  UserRole } from "@/app/types/auth.type";


const PROTECTED_ROUTES = [
  "/today",
  "/courses",
  "/students",
  "/teachers",
  "/parents",
  "/create-invoice",
  "/invoices",
  "/receipts",
  "/schedule",
  "/my-schedules",
  "/notifications",
  "/management-fee",
  "/feedback",
  "/registrars",
  "/sessions",
  "/statistics",
  "/student",
  "/teacher",
  "/parent",
  "/invoice",
  "/enrollment",
  "/registrar",
  "/session",
];


export function isProtectedRoute(route: string): boolean {
  return PROTECTED_ROUTES.some((protectedRoute) =>
    route.startsWith(protectedRoute)
  );
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
      "/invoices",
      "/receipts",
      "/schedule",
      "/my-schedules",
      "/notifications",
      "/management-fee",
      "/feedback",
      "/registrars",
      "/sessions",
      "/statistics",
      "/student",
      "/teacher",
      "/parent",
      "/invoice",
      "/enrollment",
      "/registrar",
      "/session",
    ],
    [UserRole.REGISTRAR]: [
      "/today",
      "/courses",
      "/students",
      "/teachers",
      "/parents",
      "/create-invoice",
      "/invoices",
      "/receipts",
      "/schedule",
      "/notifications",
      "/management-fee",
      "/feedback",
      "/sessions",
      "/statistics",
      "/student",
      "/teacher",
      "/parent",
      "/invoice",
      "/enrollment",
      "/session",
    ],
    [UserRole.TEACHER]: [
      "/today",
      "/courses",
      "/students",
      "/schedule",
      "/my-schedules",
    ],
  };

  const result = (
    permissions[userRole]?.some((allowedRoute) =>
      route.startsWith(allowedRoute)
    ) || false
  );
  
  return result;
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

/**
 * Get user from server-side using HttpOnly cookie
 * This calls the backend /auth/me endpoint
 */
/**
 * Get user from server-side using HttpOnly cookie
 * This calls the backend /auth/me endpoint
 */
export async function getServerSideUser(accessToken?: string) {
  try {
    const { getServerCurrentUser } = await import('./api/auth');
    const user = await getServerCurrentUser(accessToken);
    return user;
  } catch (error) {
    console.error('Failed to get server-side user:', error);
    return null;
  }
}

/**
 * Get user from token by calling backend /auth/me
 * Note: We don't decode tokens client-side, we use HttpOnly cookies
 */
export async function getUserFromToken(token?: string) {
  return getServerSideUser(token);
}
