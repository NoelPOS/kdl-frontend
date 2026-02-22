import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getFeedbacks } from "@/lib/api/feedbacks";
import type { FeedbackFilter } from "@/app/types/feedback.type";

export interface FeedbackListFilters extends FeedbackFilter {
  page?: number;
  limit?: number;
}

/**
 * Fetches the filtered + paginated feedback list.
 */
export function useFeedbackList(filters: FeedbackListFilters = {}) {
  const { page = 1, limit = 10, ...filter } = filters;
  return useQuery({
    queryKey: queryKeys.feedbacks.list(filters as Record<string, unknown>),
    queryFn: () => getFeedbacks(filter, page, limit),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
