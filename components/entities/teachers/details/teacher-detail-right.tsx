"use client";

import { useState } from "react";
import { ConnectTeacherCourseDialog } from "../dialogs/connect-teacher-course-dialog";
import { TeacherCoursesFilter } from "../filters/teacher-courses-filter";
import TeacherCoursesList from "../lists/teacher-courses-list";
import { TeacherAvailabilityTab } from "./teacher-availability-tab";
import { Teacher } from "@/app/types/teacher.type";

interface TeacherDetailRightProps {
  teacherId: number;
  teacher?: Partial<Teacher>;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export function TeacherDetailRight({
  teacherId,
  teacher,
  searchParams,
}: TeacherDetailRightProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "availability">("courses");

  const handleConnectionSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header with clear tabs */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 text-lg font-semibold rounded-md transition-all ${
              activeTab === "courses"
                ? "bg-yellow-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 text-lg font-semibold rounded-md transition-all ${
              activeTab === "availability"
                ? "bg-yellow-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Availability
          </button>
        </div>

        {activeTab === "courses" && (
          <ConnectTeacherCourseDialog
            teacherId={teacherId}
            onSuccess={handleConnectionSuccess}
          />
        )}
      </div>

      {/* Content */}
      {activeTab === "courses" && (
        <div className="p-6 pt-0">
          <TeacherCoursesFilter teacherId={teacherId} />
          <TeacherCoursesList teacherId={teacherId} searchParams={searchParams} />
        </div>
      )}

      {activeTab === "availability" && teacher && (
        <div className="p-6 pt-0">
          <TeacherAvailabilityTab
            teacher={teacher}
            onTeacherUpdate={() => window.location.reload()}
          />
        </div>
      )}
    </div>
  );
}



