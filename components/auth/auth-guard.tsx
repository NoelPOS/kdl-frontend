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

  // Show loading while checking authentication
  if (isLoading) {
    return <AuthLoadingPage />;
  }

  // Allow public routes
  const publicRoutes = [
    "/login",
    "/forgot-password",
    "/unauthorized",
    "/not-found",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, user must be authenticated
  // The context already handles redirects to login/unauthorized pages
  if (!user) {
    return <AuthLoadingPage />;
  }

  return <>{children}</>;
};

export default AuthGuard;
