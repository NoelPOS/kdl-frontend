import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { notificationApi } from "@/lib/api/notifications";
import { showToast } from "@/lib/toast";

/**
 * Mark a single notification as read.
 * Uses optimistic update to immediately show the read state in the UI.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all(),
      });
      const snapshot = queryClient.getQueriesData({
        queryKey: queryKeys.notifications.lists(),
      });
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (old: any) => ({
          ...old,
          items: old?.items?.map((n: any) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        })
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      showToast.error("Failed to mark notification as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
}

/**
 * Mark all notifications as read.
 * Invalidates the full notification cache on success.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
      showToast.success("All notifications marked as read");
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
      showToast.error("Failed to mark notifications as read");
    },
  });
}
