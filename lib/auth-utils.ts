import { UserRole } from "@/app/types/auth.type";

/**
 * Check if user has specific role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin (highest permission level)
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Check if user can manage other users (admin or registrar)
 */
export function canManageUsers(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

/**
 * Check if user can access financial data (admin or registrar)
 */
export function canAccessFinancials(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

/**
 * Check if user can manage courses
 */
export function canManageCourses(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

/**
 * Check if user can view all student data
 */
export function canViewAllStudents(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR, UserRole.TEACHER].includes(
    userRole
  );
}

/**
 * Check if user can create/edit enrollments
 */
export function canManageEnrollments(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

/**
 * Get readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.REGISTRAR:
      return "Registrar";
    case UserRole.TEACHER:
      return "Teacher";
    default:
      return "User";
  }
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-red-100 text-red-800";
    case UserRole.REGISTRAR:
      return "bg-blue-100 text-blue-800";
    case UserRole.TEACHER:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
