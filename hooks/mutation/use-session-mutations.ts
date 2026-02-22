import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createSession,
  updateSession,
  changeSessionStatus,
  completeSession,
  cancelSession,
  createPackage,
  addCoursePlus,
  submitTeacherFeedback,
  swapSessionType,
  type SessionData,
  type UpdateSessionData,
} from "@/lib/api/sessions";
import { showToast } from "@/lib/toast";
import type { SessionStatusUpdate } from "@/app/types/session.type";

/** Create a new session (enroll a student in a course). */
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionData) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all() });
      showToast.success("Session created successfully");
    },
    onError: (error) => {
      console.error("Failed to create session:", error);
      showToast.error("Failed to create session");
    },
  });
}

/** Update a session's details (course, teacher, class option, comment). */
export function useUpdateSession(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSessionData) => updateSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Session updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update session:", error);
      showToast.error("Failed to update session");
    },
  });
}

/** Change a session's status (payment, invoiceDone, comment). */
export function useChangeSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      statusUpdate,
    }: {
      sessionId: string | number;
      statusUpdate: SessionStatusUpdate;
    }) => changeSessionStatus(sessionId, statusUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all() });
      showToast.success("Session status updated");
    },
    onError: (error) => {
      console.error("Failed to change session status:", error);
      showToast.error("Failed to update session status");
    },
  });
}

/** Mark a session as completed. */
export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => completeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Session completed");
    },
    onError: (error) => {
      console.error("Failed to complete session:", error);
      showToast.error("Failed to complete session");
    },
  });
}

/** Cancel a session. */
export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => cancelSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Session cancelled");
    },
    onError: (error) => {
      console.error("Failed to cancel session:", error);
      showToast.error("Failed to cancel session");
    },
  });
}

/** Create a package purchase for a student. */
export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentId: number;
      courseName: string;
      classOption: string;
    }) => createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Package created successfully");
    },
    onError: (error) => {
      console.error("Failed to create package:", error);
      showToast.error("Failed to create package");
    },
  });
}

/** Add extra classes to an existing session (Course Plus). */
export function useAddCoursePlus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      additionalClasses,
    }: {
      sessionId: number;
      additionalClasses: number;
    }) => addCoursePlus(sessionId, additionalClasses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      showToast.success("Course plus added successfully");
    },
    onError: (error) => {
      console.error("Failed to add course plus:", error);
      showToast.error("Failed to add course plus");
    },
  });
}

/** Submit teacher feedback for a schedule session. */
export function useSubmitTeacherFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
      feedback,
      feedbackImages,
      feedbackVideos,
    }: {
      sessionId: number;
      studentId: number;
      feedback: string;
      feedbackImages?: string[];
      feedbackVideos?: string[];
    }) =>
      submitTeacherFeedback(
        sessionId,
        studentId,
        feedback,
        feedbackImages,
        feedbackVideos
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all() });
      showToast.success("Feedback submitted successfully");
    },
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
      showToast.error("Failed to submit feedback");
    },
  });
}

/** Swap a session's class type (e.g., fixed → camp). Invalidates schedules. */
export function useSwapSessionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: number;
      data: { classOptionId: number; newSchedules: any[] };
    }) => swapSessionType(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() });
      showToast.success("Session type updated");
    },
    onError: (error) => {
      console.error("Failed to swap session type:", error);
      showToast.error("Failed to update session type");
    },
  });
}
