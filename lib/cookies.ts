import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "accessToken";

/**
 * Client-side cookie utilities (for use in client components)
 * Using regular cookies (not HTTP-only) for client-side access
 */
export class ClientCookies {
  static set(token: string, options?: { maxAge?: number }) {
    if (typeof document === "undefined") return;

    const maxAge = options?.maxAge || 60 * 60 * 24; // Default 24 hours

    const cookieOptions = [
      `${COOKIE_NAME}=${token}`,
      `path=/`,
      `max-age=${maxAge}`,
      `samesite=strict`,
      process.env.NODE_ENV === "production" ? "secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookieOptions;
  }

  static get(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    const result = tokenCookie ? tokenCookie.split("=")[1] : null;
    console.log("Cookie value:", result);
    return result;
  }

  static remove() {
    if (typeof document === "undefined") return;

    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: false, // Regular cookie - accessible by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  static remove(response: NextResponse) {
    response.cookies.delete(COOKIE_NAME);
  }
}
