import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { notificationApi, type NotificationFilters } from "@/lib/api/notifications";

export interface NotificationListFilters extends NotificationFilters {
  page?: number;
  limit?: number;
}

/**
 * Fetches the paginated notification list.
 * Refetches every minute to show new notifications without manual refresh.
 */
export function useNotificationList(filters: NotificationListFilters = {}) {
  const { page = 1, limit = 20, ...rest } = filters;
  return useQuery({
    queryKey: queryKeys.notifications.list(filters as Record<string, unknown>),
    queryFn: () => notificationApi.getAll(page, limit, rest),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Fetches the unread notification count (used by the bell icon).
 * Refetches every 30 seconds.
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [...queryKeys.notifications.all(), "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}
