import React, { Suspense } from "react";
import FeedbackFilter from "@/components/entities/feedbacks/filters/feedback-filter";
import FeedbackList from "@/components/entities/feedbacks/lists/feedback-list";
import PageHeader from "@/components/shared/page-header";
import { getFilteredFeedbacks } from "@/lib/api";
import { cookies } from "next/headers";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FeedbackPageProps {
  searchParams: Promise<{
    status?: string;
    studentName?: string;
    courseName?: string;
    teacherName?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

export default async function FeedbackPage({
  searchParams,
}: FeedbackPageProps) {
  const params = await searchParams;

  const status = params.status || "";
  const studentName = params.studentName || "";
  const courseName = params.courseName || "";
  const teacherName = params.teacherName || "";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const page = parseInt(params.page || "1", 10);

  // Only show feedback list if status parameter exists (indicating a search was performed)
  const shouldShowFeedbacks = !!status;

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (shouldShowFeedbacks) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await getFilteredFeedbacks(
        { studentName, courseName, teacherName, startDate, endDate },
        1, // Just get first page for timestamp
        1, // Minimal limit
        accessToken
      );
      lastUpdated = timestamp;
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <PageHeader 
            title="Student Feedbacks" 
            lastUpdated={lastUpdated}
            className="mb-0"
          />
          <p className="text-gray-600 mt-1 ml-4">
            View and manage teacher feedback for all students
          </p>
        </div>
      </div>

      {/* Filter Section - Always visible */}
      <FeedbackFilter />

      {/* Feedback List - Only show when filters are applied */}
      {shouldShowFeedbacks ? (
        <Suspense
          key={`${studentName}-${courseName}-${teacherName}-${startDate}-${endDate}-${page}`}
          fallback={
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          }
        >
          <FeedbackList
            studentName={studentName}
            courseName={courseName}
            teacherName={teacherName}
            startDate={startDate}
            endDate={endDate}
            page={page}
          />
        </Suspense>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            Use the filter above to search for feedbacks
          </p>
          <p className="text-sm">
            Apply any filter and click &quot;Apply Filter&quot; to view results
          </p>
        </div>
      )}
    </div>
  );
}
