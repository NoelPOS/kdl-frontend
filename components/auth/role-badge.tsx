import { UserRole } from "@/app/types/auth.type";
import { getRoleDisplayName, getRoleColor } from "@/lib/auth-utils";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
        role
      )} ${className}`}
    >
      {getRoleDisplayName(role)}
    </span>
  );
}

export default RoleBadge;
