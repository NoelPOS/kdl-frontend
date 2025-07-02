"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import EditSchedule from "../schedule/dialogs/edit-schedule-dialog";
import ScheduleTable from "../schedule/schedule-table";
interface StudentScheduleProps {
  initialSchedules: ClassSchedule[];
}

function StudentSchedule({ initialSchedules }: StudentScheduleProps) {
  // console.log("initial important", initialSchedules);

  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<FormData>();

  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  // Handle schedule update
  const handleScheduleUpdate = useCallback((updatedSchedule: FormData) => {
    // console.log("Updating schedule:", updatedSchedule);
    // console.log("Current schedules:", schedules);

    // Create the updated schedule object
    const updatedScheduleData = {
      schedule_date: updatedSchedule.date,
      schedule_startTime: updatedSchedule.starttime,
      schedule_endTime: updatedSchedule.endtime,
      schedule_room: updatedSchedule.room,
      schedule_remark: updatedSchedule.remark,
      schedule_attendance: updatedSchedule.status ?? "",
    };

    // console.log("Updated schedule data:", updatedScheduleData);

    // Update current schedules - convert scheduleId to string for comparison
    setSchedules((prevSchedules) => {
      const updatedSchedules = prevSchedules.map((schedule) => {
        if (schedule.schedule_id == updatedSchedule.scheduleId.toString()) {
          // console.log("Found matching schedule to update:", schedule);
          return { ...schedule, ...updatedScheduleData };
        }
        return schedule;
      });
      // console.log("Updated schedules:", updatedSchedules);
      return updatedSchedules;
    });
  }, []);

  const handleRowDoubleClick = useCallback((session: ClassSchedule) => {
    // Fix date conversion - remove the +24 hours adjustment
    const formData: FormData = {
      date: new Date(
        new Date(session.schedule_date).getTime() + 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      starttime: session.schedule_startTime,
      endtime: session.schedule_endTime,
      course: session.course_title,
      teacher: session.teacher_name,
      student: session.student_name,
      room: session.schedule_room ?? "",
      nickname: session.student_name ?? "",
      remark: session.schedule_remark ?? "",
      status: session.schedule_attendance ?? "",
      courseId: Number(session.schedule_courseId),
      scheduleId: Number(session.schedule_id),
    };
    setSelectedSession(formData);
    setOpen(true);
  }, []);

  return (
    <div>
      <EditSchedule
        open={open}
        onOpenChange={setOpen}
        initialData={selectedSession}
        onScheduleUpdate={handleScheduleUpdate}
      />
      <ScheduleTable
        schedules={schedules}
        handleRowDoubleClick={handleRowDoubleClick}
      />
    </div>
  );
}

export default StudentSchedule;
