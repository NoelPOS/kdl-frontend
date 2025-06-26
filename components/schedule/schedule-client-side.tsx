"use client";

import React, { useState, useCallback, useMemo } from "react";
import EditSchedule from "./dialogs/edit-schedule-dialog";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import ScheduleTable from "./schedule-table";
import { useRouter } from "next/navigation";
import { formatDateLocal } from "@/lib/utils";

interface ScheduleClientSideProps {
  initialSchedules: ClassSchedule[];
}

function ScheduleClientSide({ initialSchedules }: ScheduleClientSideProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<FormData>();

  const handleScheduleUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleRowDoubleClick = useCallback((session: ClassSchedule) => {
    const formData: FormData = {
      date: formatDateLocal(new Date(session.schedule_date)),
      starttime: session.schedule_startTime,
      endtime: session.schedule_endTime,
      course: session.course_title,
      teacher: session.teacher_name,
      student: session.student_name,
      room: session.schedule_room ?? "",
      nickname: session.student_name ?? "",
      remark: session.schedule_remark ?? "",
      status: session.schedule_attendance ?? "",
      courseId: Number(session.course_id),
      scheduleId: Number(session.schedule_id),
    };
    setSelectedSession(formData);
    setOpen(true);
  }, []);

  const memoizedScheduleTable = useMemo(
    () => (
      <ScheduleTable
        schedules={initialSchedules}
        handleRowDoubleClick={handleRowDoubleClick}
      />
    ),
    [initialSchedules, handleRowDoubleClick]
  );

  return (
    <div>
      <EditSchedule
        open={open}
        onOpenChange={setOpen}
        initialData={selectedSession}
        onScheduleUpdate={handleScheduleUpdate}
      />
      {memoizedScheduleTable}
    </div>
  );
}

export default React.memo(ScheduleClientSide);
