"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { hasRoutePermission } from "@/lib/jwt";

/**
 * Custom hook for protecting routes based on user authentication and permissions
 */
export function useRouteProtection() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Public routes that don't require authentication
    const publicRoutes = [
      "/login",
      "/forgot-password",
      "/unauthorized",
      "/not-found",
    ];
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isPublicRoute) return;

    // If no user and not on public route, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has permission for current route
    if (!hasRoutePermission(user.role, pathname)) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, pathname, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAccess: user ? hasRoutePermission(user.role, pathname) : false,
  };
}

export default useRouteProtection;
