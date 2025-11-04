"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthUser, AuthResponse, UserRole } from "@/app/types/auth.type";
import {
  hasRoutePermission,
  getDefaultRouteForRole,
  isProtectedRoute,
} from "@/lib/jwt";
import { getCurrentUser as apiGetCurrentUser, logout as apiLogout } from "@/lib/api/auth";

interface AuthContextProps {
  user: AuthUser | null;
  isLoading: boolean;
  login(response: AuthResponse): void;
  logout(): void;
  hasPermission(route: string): boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auth state from HttpOnly cookie via backend - ONLY ONCE
  useEffect(() => {
    if (!isMounted || authInitialized) return;

    const initializeAuth = async () => {
      try {
        // Get user from backend using HttpOnly cookie
        const userData = await apiGetCurrentUser();
        setUser(userData);
        
        // If logged in and on login page, redirect to dashboard
        if (pathname === "/login") {
          const defaultRoute = getDefaultRouteForRole(userData.role);
          router.push(defaultRoute);
        }
      } catch (error) {
        // No valid session - user will be redirected by route protection
        setUser(null);
      } finally {
        setAuthInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isMounted, authInitialized]);

  // Check route permissions on pathname change
  useEffect(() => {
    if (!authInitialized || isLoading) {
      return;
    }
    
    const publicRoutes = [
      "/login",
      "/forgot-password",
      "/unauthorized",
      "/not-found",
    ];

    // Check if current path is public route (exact match or starts with the route)
    const isPublicRoute = pathname === "/" || publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + "/")
    );

    // If user exists and on login page, redirect to dashboard
    if (user && pathname === "/login") {
      const defaultRoute = getDefaultRouteForRole(user.role);
      router.push(defaultRoute);
      return;
    }

    // CRITICAL: If no user and not on public route, redirect to login immediately
    if (!user && !isPublicRoute) {
      router.replace("/login"); // Use replace instead of push to prevent back navigation
      return;
    }

    if (user && !isPublicRoute) {
      if (isProtectedRoute(pathname)) {
        const hasPermission = hasRoutePermission(user.role, pathname);
        
        if (!hasPermission) {
          router.replace("/unauthorized");
          return;
        }
      }
    }
  }, [pathname, user, authInitialized, isLoading, router]);

  const login = (response: AuthResponse) => {
    try {
      if (!response.accessToken || !response.user) {
        throw new Error("Invalid authentication response");
      }

      // HttpOnly cookie is set by backend automatically
      setUser(response.user);

      // Redirect to appropriate dashboard
      const defaultRoute = getDefaultRouteForRole(response.user.role);
      router.push(defaultRoute);
    } catch (error) {
      console.error("Error during login:", error);
      logout();
    }
  };

  const logout = async () => {
    try {
      // Call API to clear HttpOnly cookie on backend
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Always clear user state and redirect
      setUser(null);
      router.push("/login");
    }
  };

  const hasPermission = (route: string): boolean => {
    if (!user) return false;
    return hasRoutePermission(user.role, route);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
