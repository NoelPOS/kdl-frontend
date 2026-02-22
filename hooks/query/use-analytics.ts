import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getDashboardOverview,
  type AnalyticsFilter,
} from "@/lib/api/analytics";

/**
 * Fetches the analytics dashboard overview.
 * Stale after 5 minutes — analytics data doesn't need to be real-time.
 */
export function useAnalyticsDashboard(filter?: AnalyticsFilter) {
  return useQuery({
    queryKey: queryKeys.analytics.statistics(
      (filter ?? {}) as Record<string, unknown>
    ),
    queryFn: () => getDashboardOverview(filter),
    staleTime: 5 * 60 * 1000,
  });
}
