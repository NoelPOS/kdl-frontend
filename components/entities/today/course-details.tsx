"use client";

import React from "react";
import { Course } from "@/app/types/today.type";
import StudentSchedule from "@/components/entities/students/details/student-schedule";
import RoleAwareScheduleTable from "@/components/entities/schedule/tables/role-aware-schedule-table";
import { useAuth } from "@/context/auth.context";
import { UserRole } from "@/app/types/auth.type";

interface CourseDetailsProps {
  selectedCourse: Course | null;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ selectedCourse }) => {
  const { user } = useAuth();

  if (!selectedCourse) return null;

  // Use role-aware table for teachers, regular StudentSchedule for others
  const isTeacher = user?.role === UserRole.TEACHER;

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
          <div>
            <span className="font-medium">Teacher:</span>{" "}
            {selectedCourse.teacher}
          </div>
          <div>
            <span className="font-medium">Room:</span> {selectedCourse.room}
          </div>
        </div>
      </div>

      {isTeacher ? (
        <RoleAwareScheduleTable
          schedules={selectedCourse.students}
          userRole={user.role}
          showStudentHeader={false}
        />
      ) : (
        <StudentSchedule initialSchedules={selectedCourse.students} />
      )}
    </div>
  );
};

export default CourseDetails;
