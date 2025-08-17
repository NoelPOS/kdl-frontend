import React from "react";
import { getFilteredFeedbacks } from "@/lib/api";
import { cookies } from "next/headers";
import { Pagination } from "@/components/ui/pagination";
import ClientFeedbackList from "./client-feedback-list";
import { FeedbackFilter } from "@/app/types/feedback.type";

interface FeedbackListProps {
  studentName?: string;
  courseName?: string;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export default async function FeedbackList({
  studentName = "",
  courseName = "",
  teacherName = "",
  startDate = "",
  endDate = "",
  page = 1,
}: FeedbackListProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const filter: FeedbackFilter = {
    studentName: studentName || undefined,
    courseName: courseName || undefined,
    teacherName: teacherName || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { feedbacks, pagination } = await getFilteredFeedbacks(
    filter,
    page,
    12, // 12 items per page
    accessToken
  );

  return (
    <div className="space-y-6">
      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No feedbacks found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your filter criteria to see more results
          </div>
        </div>
      ) : (
        <ClientFeedbackList initialFeedbacks={feedbacks} />
      )}

      {feedbacks.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={12}
          itemName="feedbacks"
        />
      )}
    </div>
  );
}
