"use client";

import { SessionOverview } from "@/app/types/session.type";
import { Student } from "@/app/types/course.type";
import { StudentCourse } from "../details/student-course";
import { Pagination } from "@/components/ui/pagination";

interface StudentSessionListProps {
  sessions: SessionOverview[];
  student?: Student; // Add optional student data prop
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function StudentSessionList({
  sessions,
  student,
  pagination,
}: StudentSessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No sessions found
        </h2>
        <p className="text-gray-600">
          This student has no sessions matching the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <StudentCourse
            key={session.sessionId}
            course={session}
            student={student}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
