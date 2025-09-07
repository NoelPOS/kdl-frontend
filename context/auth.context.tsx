"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthUser, AuthResponse, UserRole } from "@/app/types/auth.type";
import {
  getStoredToken,
  removeStoredToken,
  getUserFromToken,
  isTokenExpired,
  hasRoutePermission,
  getDefaultRouteForRole,
} from "@/lib/jwt";

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

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auth state from stored token
  useEffect(() => {
    if (!isMounted) return; // Wait for client-side mounting

    const initializeAuth = () => {
      try {
        const token = getStoredToken();
        if (token) {
          if (isTokenExpired(token)) {
            // Token expired, clear storage and redirect
            removeStoredToken();
            setUser(null);
            if (
              !pathname.startsWith("/login") &&
              !pathname.startsWith("/unauthorized")
            ) {
              router.push("/login");
            }
          } else {
            // Valid token, extract user
            const userData = getUserFromToken(token);
            if (userData) {
              setUser(userData);
            } else {
              removeStoredToken();
            }
          }
        } else {
          // No token found, redirect to login if not on a public page
          if (
            !pathname.startsWith("/login") &&
            !pathname.startsWith("/forgot-password") &&
            !pathname.startsWith("/unauthorized") &&
            !pathname.startsWith("/not-found")
          ) {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        removeStoredToken();
        if (
          !pathname.startsWith("/login") &&
          !pathname.startsWith("/forgot-password") &&
          !pathname.startsWith("/unauthorized") &&
          !pathname.startsWith("/not-found")
        ) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router, pathname, isMounted]);

  // Check route permissions on pathname change
  useEffect(() => {
    if (!isLoading && user && pathname && isMounted) {
      // Allow auth pages and profile pages for all authenticated users
      if (
        pathname.startsWith("/") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/unauthorized") ||
        pathname.startsWith("/not-found")
      ) {
        return;
      }

      // Check if user has permission for current route
      if (!hasRoutePermission(user.role, pathname)) {
        router.push("/unauthorized");
      }
    }
  }, [user, pathname, isLoading, router, isMounted]);

  const login = (response: AuthResponse) => {
    try {
      if (!response.accessToken || !response.user) {
        throw new Error("Invalid authentication response");
      }

      // Token is already stored in cookie by axios login function
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
      // Clear cookie and state
      removeStoredToken();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Always clear state and redirect even on error
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
