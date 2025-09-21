import AuthLoadingPage from "@/components/auth/auth-loading";
import { TeacherSessionFilter } from "@/components/entities/sessions";
import TeacherSessionList from "@/components/entities/sessions/lists/teacher-session-list";
import PageHeader from "@/components/shared/page-header";
import { getTeacherSessionsFiltered } from "@/lib/api";
import { getUserFromToken } from "@/lib/jwt";
import { cookies } from "next/headers";
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

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (courseName || status) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      
      // Get current user info from token to get teacher ID
      const user = accessToken ? getUserFromToken(accessToken) : null;
      const teacherId = user ? parseInt(user.id) : null;

      if (teacherId) {
        const { lastUpdated: timestamp } = await getTeacherSessionsFiltered(
          teacherId,
          { courseName, status },
          1, // Just get first page for timestamp
          1, // Minimal limit
          accessToken
        );
        lastUpdated = timestamp;
      }
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content - No left sidebar for teacher profile */}
      <div className="flex-1 p-6">
        <PageHeader title="My Sessions" lastUpdated={lastUpdated} />

        <TeacherSessionFilter />

        {!courseName && !status ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for sessions.
          </div>
        ) : (
          <Suspense
            key={`${courseName || ""}${status || ""}${currentPage}`}
            fallback={<AuthLoadingPage />}
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
