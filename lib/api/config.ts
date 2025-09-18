import axios, { AxiosInstance } from "axios";
import { ClientCookies } from "../cookies";

// Extend axios config to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: Date };
  }
  interface AxiosResponse {
    lastFetched?: Date;
  }
}

// Base axios instance
const createBaseInstance = (baseURL?: string): AxiosInstance => {

  return axios.create({
    baseURL:  baseURL || process.env.NEXT_PUBLIC_BACKEND_URL,
    timeout: 15000, // 10 second timeout
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Client-side axios instance
export const clientApi = createBaseInstance();

// Request interceptor for client-side requests
clientApi.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Skip auth header for login endpoint
    if (config.url?.includes("/auth/login")) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Login request - skipping auth header");
      }
      return config;
    }

    // Add auth token to requests (except login)
    const token = ClientCookies.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV !== "production") {
        console.log("Added auth header with token");
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log("No token available - request without auth header");
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for client-side requests
clientApi.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    // Add last fetched timestamp to response
    response.lastFetched = endTime;

    if (duration > 2000) {
      console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
    }

    return response;
  },
  (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/unauthorized")
      ) {
        window.location.href = "/unauthorized";
      }
    }

    return Promise.reject(error);
  }
);

// Server-side axios instance factory
export const createServerApi = async (
  accessToken?: string
): Promise<AxiosInstance> => {
  const serverApi = createBaseInstance();

  // Get token from parameter or cookies
  let token = accessToken;
  if (!token && typeof window === "undefined") {
    try {
      // Dynamic import for server-side only
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    } catch {
      // cookies() might not be available in all contexts
    }
  }

  // Add request interceptor for server-side requests
  serverApi.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() };

      // Skip auth header for login endpoint
      if (config.url?.includes("/auth/login")) {
        return config;
      }

      // Add auth token if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for performance monitoring
  serverApi.interceptors.response.use(
    (response) => {
      const endTime = new Date();
      const startTime = response.config.metadata?.startTime;
      const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

      // Add last fetched timestamp to response
      response.lastFetched = endTime;

      if (duration > 2000) {
        console.warn(
          `Slow API call: ${response.config.url} took ${duration}ms`
        );
      }

      return response;
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Server API Error:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,  
          message: error.message,
        });
      }
      return Promise.reject(error);
    }
  );

  return serverApi;
};

// Legacy support - default export is client API
export default clientApi;
