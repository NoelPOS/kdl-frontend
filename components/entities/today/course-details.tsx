"use client";

import React from "react";
import { Course } from "@/app/types/today.type";
import RoleAwareScheduleTable from "@/components/entities/schedule/tables/role-aware-schedule-table";
import { useAuth } from "@/context/auth.context";
import { UserRole } from "@/app/types/auth.type";

interface CourseDetailsProps {
  selectedCourse: Course | null;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ selectedCourse }) => {
  const { user } = useAuth();

  if (!selectedCourse) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col text-sm">
          <div>
            <span className="font-medium">Class:</span>{" "}
            {selectedCourse.title.split(" (")[0]}
          </div>
          <div>
            <span className="font-medium">Time:</span> {selectedCourse.fullTime}
          </div>
        </div>
      </div>
      <RoleAwareScheduleTable
        schedules={selectedCourse.students}
        userRole={user?.role ?? UserRole.ADMIN}
        showStudentHeader={false}
        hideCourseInfo={true}
      />
    </div>
  );
};

export default CourseDetails;
