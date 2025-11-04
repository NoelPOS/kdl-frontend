import { UserRole } from "@/app/types/auth.type";


export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

export function hasAnyRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}


export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

export function canManageUsers(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}


export function canAccessFinancials(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

export function canViewAllStudents(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR, UserRole.TEACHER].includes(
    userRole
  );
}

export function canManageEnrollments(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.REGISTRAR].includes(userRole);
}

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
