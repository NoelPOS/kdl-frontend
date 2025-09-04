import type { AxiosResponse } from "axios";

// Type helper to add lastUpdated to API responses
export type WithLastUpdated<T> = T & { lastUpdated?: Date };

// Utility function to extract timestamp from axios response
export function extractTimestamp<T>(response: AxiosResponse<T>): WithLastUpdated<T> {
  return {
    ...response.data,
    lastUpdated: response.lastFetched
  };
}

// Higher-order function to wrap API functions with timestamp extraction
export function withTimestamp<TArgs extends any[], TResult>(
  apiFunction: (...args: TArgs) => Promise<AxiosResponse<TResult>>
) {
  return async (...args: TArgs): Promise<WithLastUpdated<TResult>> => {
    const response = await apiFunction(...args);
    return extractTimestamp(response);
  };
}

// For functions that already return unwrapped data, we need a different approach
export function wrapApiResponse<T>(
  originalFunction: (...args: any[]) => Promise<T>,
  apiCall: (...args: any[]) => Promise<AxiosResponse<T>>
) {
  return async (...args: any[]): Promise<WithLastUpdated<T>> => {
    const response = await apiCall(...args);
    return extractTimestamp(response);
  };
}
