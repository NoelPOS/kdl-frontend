"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import { UserRole } from "@/app/types/auth.type";
import { useAuth } from "@/context/auth.context";
import RoleAwareScheduleTable from "@/components/entities/schedule/tables/role-aware-schedule-table";

interface TeacherSessionScheduleProps {
  initialSchedules: ClassSchedule[];
}

export default function TeacherSessionSchedule({
  initialSchedules,
}: TeacherSessionScheduleProps) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);

  useEffect(() => {
    // Sort initial schedules by date
    const sortedInitialSchedules = [...initialSchedules].sort((a, b) => {
      const dateA = new Date(a.schedule_date);
      const dateB = new Date(b.schedule_date);
      return dateA.getTime() - dateB.getTime();
    });
    setSchedules(sortedInitialSchedules);
  }, [initialSchedules]);

  const handleScheduleUpdate = useCallback((updatedSchedule: FormData) => {
    console.log("Updating schedule in UI:", updatedSchedule);

    const updatedScheduleData = {
      schedule_date: updatedSchedule.date,
      schedule_startTime: updatedSchedule.starttime,
      schedule_endTime: updatedSchedule.endtime,
      schedule_room: updatedSchedule.room,
      schedule_remark: updatedSchedule.remark,
      schedule_feedback: updatedSchedule.feedback || "", // Update feedback field
      schedule_attendance: updatedSchedule.status ?? "",
      schedule_warning: updatedSchedule.warning ?? "",
      teacher_name: updatedSchedule.teacher,
      student_name: updatedSchedule.student,
      student_nickname: updatedSchedule.nickname,
      course_title: updatedSchedule.course,
    };

    setSchedules((prevSchedules) => {
      const updatedSchedules = prevSchedules.map((schedule) => {
        if (
          Number(schedule.schedule_id) == Number(updatedSchedule.scheduleId)
        ) {
          console.log(
            "Found matching schedule, updating:",
            schedule.schedule_id
          );
          return { ...schedule, ...updatedScheduleData };
        }
        return schedule;
      });

      // Sort schedules by date to maintain proper order
      const sortedSchedules = updatedSchedules.sort((a, b) => {
        const dateA = new Date(a.schedule_date);
        const dateB = new Date(b.schedule_date);
        return dateA.getTime() - dateB.getTime();
      });

      console.log("Updated and sorted schedules:", sortedSchedules);
      return sortedSchedules;
    });
  }, []);

  // Default to TEACHER role if user is not available (shouldn't happen in practice)
  const userRole = user?.role || UserRole.TEACHER;

  return (
    <div>
      <RoleAwareScheduleTable
        schedules={schedules}
        userRole={userRole}
        showStudentHeader={false} // Show all students in session, not single student header
        onScheduleUpdate={handleScheduleUpdate}
      />
    </div>
  );
}
