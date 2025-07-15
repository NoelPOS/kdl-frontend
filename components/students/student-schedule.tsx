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

  const handleScheduleUpdate = useCallback((updatedSchedule: FormData) => {
    console.log("Updating schedule in UI:", updatedSchedule);

    const updatedScheduleData = {
      schedule_date: updatedSchedule.date,
      schedule_startTime: updatedSchedule.starttime,
      schedule_endTime: updatedSchedule.endtime,
      schedule_room: updatedSchedule.room,
      schedule_remark: updatedSchedule.remark,
      schedule_attendance: updatedSchedule.status ?? "",
      schedule_warning: updatedSchedule.warning ?? "",
      teacher_name: updatedSchedule.teacher,
      student_name: updatedSchedule.student,
      student_nickname: updatedSchedule.nickname,
      course_title: updatedSchedule.course,
    };

    setSchedules((prevSchedules) => {
      const updatedSchedules = prevSchedules.map((schedule) => {
        console.log(schedule.schedule_id);
        console.log(updatedSchedule.scheduleId);
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
      console.log("Updated schedules:", updatedSchedules);
      return updatedSchedules;
    });
  }, []);

  const handleRowDoubleClick = useCallback((session: ClassSchedule) => {
    console.log("Row double clicked:", session);
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
      studentId: Number(session.student_id),
      room: session.schedule_room ?? "",
      nickname: session.student_nickname ?? session.student_name ?? "",
      remark: session.schedule_remark ?? "",
      status: session.schedule_attendance ?? "",
      courseId: Number(session.schedule_courseId),
      scheduleId: Number(session.schedule_id),
      warning: session.schedule_warning ?? "",
    };
    // console.log("Prepared form data:", formData);
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
