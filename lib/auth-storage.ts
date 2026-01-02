/**
 * Auth Storage Utility
 * Handles token storage for both cookie-based (EC2) and header-based (Vercel) auth
 */

const TOKEN_KEY = 'accessToken';
const USE_COOKIES_KEY = 'useCookies';

// Helper to set a regular (non-HttpOnly) cookie that middleware can read
function setAuthModeCookie(mode: 'cookie' | 'header' | null) {
  if (typeof document === 'undefined') return;
  
  if (mode === null) {
    // Clear cookie
    document.cookie = 'authMode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } else {
    // Set cookie with 8-hour expiry (match JWT)
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString();
    document.cookie = `authMode=${mode}; path=/; expires=${expires}; SameSite=Lax`;
  }
}

// Helper to set/clear the accessToken cookie for server components (Vercel only)
function setAccessTokenCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  
  if (token === null) {
    // Clear cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } else {
    // Set cookie with 8-hour expiry (match JWT)
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString();
    // Note: This is NOT HttpOnly so it can be read by client JS, but server components need it
    document.cookie = `accessToken=${token}; path=/; expires=${expires}; SameSite=Lax`;
  }
}

export const authStorage = {
  /**
   * Save login response
   * @param accessToken JWT token
   * @param useCookies Whether backend is using cookies (EC2) or not (Vercel)
   */
  saveAuth(accessToken: string, useCookies: boolean) {
    if (!useCookies) {
      // On Vercel: Store token in localStorage for Authorization headers
      // AND in a regular cookie for server components to read
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USE_COOKIES_KEY, 'false');
        // Set marker cookie so middleware knows we're authenticated
        setAuthModeCookie('header');
        // Set accessToken cookie for server components (non-HttpOnly)
        setAccessTokenCookie(accessToken);
      }
    } else {
      // On EC2: Backend sets HttpOnly cookie, just remember we're using cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem(USE_COOKIES_KEY, 'true');
        // Don't store token - it's in the HttpOnly cookie set by backend
        setAuthModeCookie('cookie');
      }
    }
  },

  /**
   * Get access token (for Authorization header)
   * Returns null if using cookies (token is in HttpOnly cookie)
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const useCookies = localStorage.getItem(USE_COOKIES_KEY) === 'true';
    if (useCookies) {
      // Using cookies - don't send Authorization header
      return null;
    }
    
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if we're using cookie-based auth
   */
  isUsingCookies(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(USE_COOKIES_KEY) === 'true';
  },

  /**
   * Clear auth data on logout
   */
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USE_COOKIES_KEY);
      // Clear the marker cookie
      setAuthModeCookie(null);
      // Clear the accessToken cookie (for Vercel server components)
      setAccessTokenCookie(null);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const useCookies = this.isUsingCookies();
    if (useCookies) {
      // Cookie-based: Assume authenticated (backend will validate)
      return true;
    }
    
    // Header-based: Check if token exists
    return !!this.getToken();
  },
};
