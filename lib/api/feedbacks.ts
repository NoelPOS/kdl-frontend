import {
  FeedbackFilter,
  FeedbackResponse,
  FeedbackItem,
  VerifyFeedbackResponse,
} from "@/app/types/feedback.type";
import { clientApi, createServerApi } from "./config";

// Get filtered feedbacks with pagination (server-side for admin/registrar)
export async function getFilteredFeedbacks(
  filter: FeedbackFilter,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<FeedbackResponse> {
  const api = await createServerApi(accessToken);

  const params = new URLSearchParams();

  if (filter.studentName) params.set("studentName", filter.studentName);
  if (filter.courseName) params.set("courseName", filter.courseName);
  if (filter.teacherName) params.set("teacherName", filter.teacherName);
  if (filter.startDate) params.set("startDate", filter.startDate);
  if (filter.endDate) params.set("endDate", filter.endDate);

  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const res = await api.get<FeedbackResponse>(
    `/schedules/feedbacks?${params.toString()}`
  );
  return res.data;
}

// Update feedback and mark as verified (client-side for admin/registrar)
export async function updateFeedback(
  scheduleId: string,
  updatedFeedback: string
): Promise<{ success: boolean; message: string; feedbackRemoved: boolean }> {
  const res = await clientApi.patch<VerifyFeedbackResponse>(
    `/schedules/${scheduleId}/verify-feedback`,
    {
      feedback: updatedFeedback,
    }
  );

  // Return a simplified response indicating the feedback should be removed
  return {
    success: res.data.success,
    message: res.data.message,
    feedbackRemoved: true, // Since verifyFb is always set to true
  };
}
