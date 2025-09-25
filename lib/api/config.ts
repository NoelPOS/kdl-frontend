import axios, { AxiosInstance } from "axios";
import { ClientCookies } from "../cookies";

// Global error handler function
const handleGlobalError = (error: any) => {
  // Only handle errors on the client side
  if (typeof window === "undefined") {
    return;
  }

  // Check if error should skip global handling
  if (error && typeof error === 'object' && error[Symbol.for('SKIP_GLOBAL_ERROR')] === true) {
    return;
  }

  // Dynamic import to avoid SSR issues
  const showToast = async (message: string) => {
    try {
      const { showToast: toast } = await import("../toast");
      toast.error(message);
    } catch (importError) {
      console.error("Failed to import toast:", importError);
      // Fallback to console error if toast fails
      console.error("Error:", message);
    }
  };

  // Handle structured validation errors
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const validationErrors = error.response.data.errors;
    
    // Show each validation error
    validationErrors.forEach((err: any) => {
      const fieldName = err.property || 'Field';
      const message = err.message || 'Validation failed';
      showToast(`${fieldName}: ${message}`);
      console.log(`Validation Error - ${fieldName}: ${message}`);
    });
    
    // Also log general message if available
    if (error.response?.data?.message) {
      console.log("General validation message:", error.response.data.message);
    }
    
    return;
  }

  // Handle single error message
  if (error.response?.data?.message) {
    showToast(error.response.data.message);
    return;
  }

  // Handle string error response
  if (typeof error.response?.data === "string") {
    showToast(error.response.data);
    return;
  }

  // Handle network errors
  if (!error.response) {
    showToast("Network error. Please check your connection and try again.");
    return;
  }

  // Handle HTTP status codes
  const status = error.response?.status;
  switch (status) {
    case 400:
      showToast("Bad request. Please check your input and try again.");
      break;
    case 404:
      showToast("Resource not found.");
      break;
    case 409:
      showToast("Conflict error. The resource may have been modified by another user.");
      break;
    case 422:
      showToast("Validation error. Please check your input.");
      break;
    case 500:
      showToast("Internal server error. Please try again later.");
      break;
    case 502:
    case 503:
    case 504:
      showToast("Server temporarily unavailable. Please try again later.");
      break;
    default:
      // Don't show toast for auth errors (401, 403) as they're handled separately
      if (status !== 401 && status !== 403) {
        showToast(`Request failed with status ${status}. Please try again.`);
      }
  }
};

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
        data: error.response?.data,
      });
    }

    // Handle authentication errors first (before global error handler)
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
    } else {
      // Handle all other errors with global error handler
      handleGlobalError(error);
    }

    return Promise.reject(error);
  }
);

// Single global server-side axios instance
export const serverApi = createBaseInstance();

// Smart request interceptor that gets token dynamically
serverApi.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: new Date() };

    // Skip auth header for login endpoint
    if (config.url?.includes("/auth/login")) {
      return config;
    }

    // Get token from multiple sources
    let token = config.headers['X-Access-Token'];
    
    // Safely handle header value (could be string, string[], or undefined)
    if (Array.isArray(token)) {
      token = token[0]; // Take first value if array
    } else if (typeof token !== 'string') {
      token = undefined; // Ensure it's either string or undefined
    }
    
    if (!token && typeof window === "undefined") {
      try {
        // Server-side: get from cookies
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        token = cookieStore.get("accessToken")?.value || undefined;
      } catch {
        // cookies() might not be available in all contexts
      }
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

// Legacy support - keep createServerApi for backward compatibility during migration
export const createServerApi = async (accessToken?: string): Promise<AxiosInstance> => {
  console.warn("createServerApi is deprecated, use serverApi directly");
  return serverApi;
};

// Legacy support - default export is client API
export default clientApi;
