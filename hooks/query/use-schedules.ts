import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getTodaySchedulesClient,
  getFilteredSchedulesClient,
  checkScheduleConflict,
  type ScheduleFilter,
  type ScheduleConflictCheck,
} from "@/lib/api/schedules";
import { format } from "date-fns";

/**
 * Fetches today's schedules.
 * Refetches every 2 minutes since today's schedule can change during the day.
 */
export function useTodaySchedules() {
  const today = format(new Date(), "yyyy-MM-dd");
  return useQuery({
    queryKey: queryKeys.today.schedule(today),
    queryFn: () => getTodaySchedulesClient(),
    staleTime: 2 * 60 * 1000, // 2 minutes — schedule changes during the day
    refetchInterval: 2 * 60 * 1000,
  });
}

export interface ScheduleListFilters extends ScheduleFilter {
  page?: number;
  limit?: number;
}

/**
 * Fetches filtered + paginated schedules.
 */
export function useScheduleList(filters: ScheduleListFilters = {}) {
  const { page = 1, limit = 10, ...filter } = filters;
  return useQuery({
    queryKey: queryKeys.schedules.list(filters as Record<string, unknown>),
    queryFn: () => getFilteredSchedulesClient(filter, page, limit),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Checks for schedule conflicts.
 * Use with enabled: false and refetch() for manual triggering.
 * This prevents automatic firing before user completes the form.
 */
export function useScheduleConflictCheck(
  params: ScheduleConflictCheck,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.schedules.all(), "conflict", params],
    queryFn: () => checkScheduleConflict(params),
    enabled: options?.enabled ?? false,
    staleTime: 0, // Always fresh — conflicts change quickly
    gcTime: 0, // Don't cache — each check is unique
  });
}
