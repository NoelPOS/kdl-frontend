import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { updateFeedback } from "@/lib/api/feedbacks";
import { showToast } from "@/lib/toast";

/**
 * Update (verify) a feedback record on a schedule.
 * Invalidates both feedback and schedule caches.
 */
export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      updatedFeedback,
      images,
      videos,
    }: {
      scheduleId: string | number;
      updatedFeedback: string;
      images?: string[];
      videos?: string[];
    }) => updateFeedback(String(scheduleId), updatedFeedback, images, videos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      showToast.success("Feedback updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update feedback:", error);
      showToast.error("Failed to update feedback");
    },
  });
}
