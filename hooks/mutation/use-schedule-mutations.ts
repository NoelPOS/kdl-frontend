import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createBulkSchedules,
  updateSchedule,
  verifyScheduleFeedback,
} from "@/lib/api/schedules";
import { showToast } from "@/lib/toast";

/** Create multiple schedules in bulk. Invalidates all schedule + today caches. */
export function useCreateBulkSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedules: any[]) => createBulkSchedules(schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.today.all() });
      showToast.success("Schedules created successfully");
    },
    onError: (error) => {
      console.error("Failed to create schedules:", error);
      showToast.error("Failed to create schedules");
    },
  });
}

/** Update a single schedule. Invalidates schedule list and today's view. */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number;
      data: Parameters<typeof updateSchedule>[1];
    }) => updateSchedule(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.today.all() });
      showToast.success("Schedule updated");
    },
    onError: (error) => {
      console.error("Failed to update schedule:", error);
      showToast.error("Failed to update schedule");
    },
  });
}

/** Verify and update a schedule's feedback. Invalidates feedbacks and schedules. */
export function useVerifyScheduleFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number;
      data: Parameters<typeof verifyScheduleFeedback>[1];
    }) => verifyScheduleFeedback(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all() });
      showToast.success("Feedback verified");
    },
    onError: (error) => {
      console.error("Failed to verify feedback:", error);
      showToast.error("Failed to verify feedback");
    },
  });
}
