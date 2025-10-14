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
    "/",
    "/login",
    "/forgot-password",
    "/unauthorized",
    "/not-found",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Show loading while checking authentication ONLY for protected routes
  if (isLoading && !isPublicRoute) {
    return <AuthLoadingPage />;
  }

  // For public routes, always show content (don't check auth)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, show loading if no user (redirect is happening)
  if (!user && !isLoading) {
    return <AuthLoadingPage />;
  }

  return <>{children}</>;
};

export default AuthGuard;
