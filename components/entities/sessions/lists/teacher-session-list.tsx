import React from "react";
import { getTeacherSessionsFiltered, TeacherSessionFilter } from "@/lib/api";
import { cookies } from "next/headers";
import { Pagination } from "@/components/ui/pagination";
import TeacherSessionCard from "../cards/teacher-session-card";
import { getUserFromToken } from "@/lib/jwt";

export default async function TeacherSessionList({
  courseName,
  status,
  page = 1,
}: {
  courseName: string;
  status: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Get current user info from backend (using HttpOnly cookie)
  const user = accessToken ? await getUserFromToken(accessToken) : null;
  const teacherId = user ? parseInt(user.id) : null;

  if (!teacherId) {
    return (
      <div className="text-center text-red-500 py-8">
        Unable to load sessions. Please login again.
      </div>
    );
  }

  const filter: TeacherSessionFilter = {
    courseName,
    status,
  };

  const { sessions, pagination } = await getTeacherSessionsFiltered(
    teacherId,
    filter,
    page,
    12,
    accessToken
  );

  return (
    <div className="space-y-6">
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No sessions found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sessions.map((session) => (
            <TeacherSessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      )}

      {sessions.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={12}
          itemName="sessions"
        />
      )}
    </div>
  );
}
