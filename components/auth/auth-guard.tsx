"use client";
import React from "react";
import { useAuth } from "@/context/auth.context";
import { usePathname } from "next/navigation";
import AuthLoadingPage from "./auth-loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Define public routes
  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/unauthorized",
    "/not-found",
    "/liff", // LIFF routes use LINE authentication, not admin auth
  ];
  
  // Check if current path is public route (exact match or starts with the route)
  const isPublicRoute = pathname === "/" || publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Show loading while checking authentication ONLY for protected routes
  if (isLoading && !isPublicRoute) {
    return <AuthLoadingPage />;
  }

  // For protected routes, block access if no user
  if (!isPublicRoute && !user) {
    return <AuthLoadingPage />;
  }

  // For public routes, always show content
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // User is authenticated and on a protected route
  return <>{children}</>;
};

export default AuthGuard;
