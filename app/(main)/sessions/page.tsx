import { TeacherSessionFilter } from "@/components/entities/sessions";
import TeacherSessionList from "@/components/entities/sessions/lists/teacher-session-list";
import { Suspense } from "react";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseName?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const { courseName, status, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="flex min-h-screen">
      {/* Main Content - No left sidebar for teacher profile */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-around w-full gap-4">
            <div className="flex-1/4 text-3xl font-medium">My Sessions</div>
          </div>
        </div>

        <TeacherSessionFilter />

        {!courseName && !status ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for sessions.
          </div>
        ) : (
          <Suspense
            key={`${courseName || ""}${status || ""}${currentPage}`}
            fallback={<div>Loading...</div>}
          >
            <TeacherSessionList
              courseName={courseName || ""}
              status={status || ""}
              page={currentPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
