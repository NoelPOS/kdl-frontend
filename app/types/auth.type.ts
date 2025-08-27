export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Add any other user properties that come from your JWT payload
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface DecodedToken {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export enum UserRole {
  ADMIN = "admin",
  REGISTRAR = "registrar",
  TEACHER = "teacher",
}

export const USER_ROLE_LABELS = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.REGISTRAR]: "Registrar",
  [UserRole.TEACHER]: "Teacher",
} as const;

// Route access configuration based on roles
export const ROUTE_PERMISSIONS = {
  // Admin has access to everything
  [UserRole.ADMIN]: [
    "/",
    "/today",
    "/courses",
    "/students",
    "/teachers",
    "/parents",
    "/enrollments",
    "/packages",
    "/invoices",
    "/receipts",
    "/schedule",
    "/notifications",
    "/management-fee",
    "/feedback",
  ],
  // Registrar has limited access
  [UserRole.REGISTRAR]: [
    "/",
    "/today",
    "/courses",
    "/students",
    "/parents",
    "/enrollments",
    "/packages",
    "/invoices",
    "/receipts",
    "/schedule",
    "/feedbacks",
  ],
  // Teacher has most limited access
  [UserRole.TEACHER]: ["/", "/today", "/courses", "/students", "/schedule"],
} as const;
