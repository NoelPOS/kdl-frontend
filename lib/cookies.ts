import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "accessToken";

/**
 * Client-side cookie utilities (for use in client components)
 * Using regular cookies (not HTTP-only) for client-side access
 */
export class ClientCookies {
  static set(token: string, options?: { maxAge?: number }) {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    try {
      const maxAge = options?.maxAge || 60 * 60 * 24; // Default 24 hours

      // Check if we're on HTTPS or localhost for secure flag
      // Also check for force insecure cookies flag for EC2 deployment
      const isSecure = typeof window !== "undefined" && 
        (window.location.protocol === "https:" || window.location.hostname === "localhost") &&
        !process.env.NEXT_PUBLIC_FORCE_INSECURE_COOKIES;

      const cookieOptions = [
        `${COOKIE_NAME}=${token}`,
        `path=/`,
        `max-age=${maxAge}`,
        `samesite=lax`,
        isSecure ? "secure" : "",
      ]
        .filter(Boolean)
        .join("; ");

      console.log("Setting cookie with options:", cookieOptions);
      console.log("isSecure:", isSecure);
      console.log("Protocol:", typeof window !== "undefined" ? window.location.protocol : "server");
      console.log("FORCE_INSECURE_COOKIES:", process.env.NEXT_PUBLIC_FORCE_INSECURE_COOKIES);
      
      document.cookie = cookieOptions;
      
      // Verify cookie was set
      setTimeout(() => {
        const verification = ClientCookies.get();
        console.log("Cookie verification after setting:", verification ? "SUCCESS" : "FAILED");
      }, 100);
    } catch (error) {
      console.error("Error setting cookie:", error);
    }
  }

  static get(): string | null {
    if (typeof document === "undefined" || typeof window === "undefined") return null;
    
    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${COOKIE_NAME}=`)
      );

      const result = tokenCookie ? tokenCookie.split("=")[1] : null;
      console.log("Cookie value:", result);
      return result;
    } catch (error) {
      console.error("Error reading cookie:", error);
      return null;
    }
  }

  static remove() {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    try {
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (error) {
      console.error("Error removing cookie:", error);
    }
  }
}

/**
 * Middleware cookie utilities (for use in Next.js middleware)
 */
export class MiddlewareCookies {
  static get(request: NextRequest): string | undefined {
    return request.cookies.get(COOKIE_NAME)?.value;
  }

  static set(response: NextResponse, token: string) {
    // Check if we should use secure cookies based on the request protocol
    // For EC2 deployment without domain, allow insecure cookies
    const isSecure = process.env.NODE_ENV === "production" && 
      process.env.NEXT_PUBLIC_BACKEND_URL?.startsWith("https://") &&
      !process.env.NEXT_PUBLIC_FORCE_INSECURE_COOKIES;

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: false, // Regular cookie - accessible by JavaScript
      secure: isSecure,
      sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  static remove(response: NextResponse) {
    response.cookies.delete(COOKIE_NAME);
  }
}
