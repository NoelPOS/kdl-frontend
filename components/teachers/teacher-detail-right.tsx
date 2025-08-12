"use client";

import { ConnectTeacherCourseDialog } from "./connect-teacher-course-dialog";
import { TeacherCoursesFilter } from "./teacher-courses-filter";
import TeacherCoursesList from "./teacher-courses-list";

interface TeacherDetailRightProps {
  teacherId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export function TeacherDetailRight({
  teacherId,
  searchParams,
}: TeacherDetailRightProps) {
  const handleConnectionSuccess = () => {
    // Force a refresh of the courses list
    window.location.reload();
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Courses</h2>
            <p className="text-sm text-gray-600">
              Courses this teacher can teach
            </p>
          </div>
          <ConnectTeacherCourseDialog
            teacherId={teacherId}
            onSuccess={handleConnectionSuccess}
          />
        </div>
      </div>

      <div className="p-6">
        <TeacherCoursesFilter teacherId={teacherId} />
        <TeacherCoursesList teacherId={teacherId} searchParams={searchParams} />
      </div>
    </div>
  );
}
