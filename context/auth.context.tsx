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

  // Initialize auth state from stored token or HttpOnly cookie - ONLY ONCE
  useEffect(() => {
    if (!isMounted || authInitialized) return;

    const initializeAuth = async () => {
      try {
        // Try new method first: Get user from backend using HttpOnly cookie
        try {
          const userData = await apiGetCurrentUser();
          setUser(userData);
          setAuthInitialized(true);
          
          // If logged in and on login page, redirect to dashboard
          if (pathname === "/login") {
            const defaultRoute = getDefaultRouteForRole(userData.role);
            router.push(defaultRoute);
          }
          return;
        } catch (apiError: any) {
          // Fallback to old method: Check local token
          const token = getStoredToken();
          if (token) {
            if (isTokenExpired(token)) {
              removeStoredToken();
              setUser(null);
              setAuthInitialized(true);
            } else {
              const userData = getUserFromToken(token);
              if (userData) {
                setUser(userData);
                setAuthInitialized(true);
                if (pathname === "/login") {
                  const defaultRoute = getDefaultRouteForRole(userData.role);
                  router.push(defaultRoute);
                }
              } else {
                removeStoredToken();
                setUser(null);
                setAuthInitialized(true);
              }
            }
          } else {
            setUser(null);
            setAuthInitialized(true);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        removeStoredToken();
        setUser(null);
        setAuthInitialized(true);
      } finally {
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

    // If user exists and on a protected route, check permissions
    if (user && !isPublicRoute) {
      const hasPermission = hasRoutePermission(user.role, pathname);
      
      if (!hasPermission) {
        router.replace("/unauthorized");
        return;
      }
    }
  }, [pathname, user, authInitialized, isLoading, router]);

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
      // Call API to clear HttpOnly cookie on backend
      await apiLogout();
      
      // Clear local storage token
      removeStoredToken();
      
      // Clear user state
      setUser(null);
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Always clear state and redirect even on error
      removeStoredToken();
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
