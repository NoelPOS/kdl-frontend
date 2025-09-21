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
    <div className="space-y-6 max-w-full">
      <div className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg max-w-full">
        <div className="flex flex-col gap-2 sm:gap-3 mb-4">
          <div className="text-sm sm:text-base lg:text-lg">
            <span className="font-medium text-gray-700">Class:</span> 
            <span className="ml-2 break-words">{selectedCourse.title.split(" (")[0]}</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg">
            <span className="font-medium text-gray-700">Time:</span> 
            <span className="ml-2">{selectedCourse.fullTime}</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg">
            <span className="font-medium text-gray-700">Teacher:</span> 
            <span className="ml-2 break-words">{selectedCourse.teacher}</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg">
            <span className="font-medium text-gray-700">Room:</span> 
            <span className="ml-2">{selectedCourse.room}</span>
          </div>
        </div>
        <RoleAwareScheduleTable
          schedules={selectedCourse.students}
          userRole={user?.role ?? UserRole.ADMIN}
          showStudentHeader={false}
          hideCourseInfo={true}
          shouldRefreshOnUpdate={true}
        />
      </div>
    </div>
  );
};

export default CourseDetails;
