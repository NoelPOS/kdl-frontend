"use client";

import { ConnectTeacherCourseDialog } from "../dialogs/connect-teacher-course-dialog";
import { TeacherCoursesFilter } from "../filters/teacher-courses-filter";
import TeacherCoursesList from "../lists/teacher-courses-list";

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
      <div className="">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Courses</h2>
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
