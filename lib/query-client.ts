import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds — no refetch within this window
        staleTime: 30 * 1000,
        // Keep unused data in cache for 5 minutes before garbage collecting
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once (avoids hammering on 404s or auth errors)
        retry: 1,
        // Refetch when the browser window regains focus (good for long-open tabs)
        refetchOnWindowFocus: true,
      },
      mutations: {
        // Never retry mutations — side effects must not duplicate
        retry: false,
      },
    },
  });
}

// Singleton for the browser — avoids creating a new client on every render
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always return a fresh client (each request is isolated)
    return makeQueryClient();
  }
  // Browser: reuse the singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
