"use client";

import React, { useState, useCallback, useEffect } from "react";
import EditSchedule from "./dialogs/edit-schedule-dialog";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import ScheduleTable from "./schedule-table";
import { formatDateLocal } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

interface ScheduleClientSideProps {
  initialSchedules?: ClassSchedule[];
  initialPagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function ScheduleClientSide({
  initialSchedules = [],
  initialPagination,
}: ScheduleClientSideProps) {
  const params = useSearchParams();
  const [open, setOpen] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);
  const [pagination, setPagination] = useState(
    initialPagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrev: false,
    }
  );
  const [selectedSession, setSelectedSession] = useState<FormData>();

  const handleRowDoubleClick = useCallback((session: ClassSchedule) => {
    console.log("Row double clicked:", session);
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
      courseId: Number(session.schedule_courseId),
      scheduleId: Number(session.schedule_id),
    };
    setSelectedSession(formData);
    setOpen(true);
  }, []);

  useEffect(() => {
    // Set initial data when component mounts
    if (initialSchedules.length > 0) {
      setSchedules(initialSchedules);
    }
    if (initialPagination) {
      setPagination(initialPagination);
    }
  }, [initialSchedules, initialPagination]);

  const handleScheduleUpdate = (updatedFormData: FormData) => {
    // Convert FormData back to ClassSchedule format and update the schedule in the list
    setSchedules((prev) =>
      prev.map((s) =>
        String(s.schedule_id) === String(updatedFormData.scheduleId)
          ? {
              ...s,
              schedule_date: updatedFormData.date,
              schedule_startTime: updatedFormData.starttime,
              schedule_endTime: updatedFormData.endtime,
              schedule_room: updatedFormData.room || "",
              schedule_remark: updatedFormData.remark || "",
              schedule_attendance: updatedFormData.status || "",
            }
          : s
      )
    );
  };

  return (
    <div>
      <EditSchedule
        open={open}
        onOpenChange={setOpen}
        initialData={selectedSession}
        onScheduleUpdate={handleScheduleUpdate}
      />

      {params.size > 0 && (
        <>
          <ScheduleTable
            schedules={schedules}
            handleRowDoubleClick={handleRowDoubleClick}
            showStudentHeader={false}
          />
          {schedules.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              itemsPerPage={10}
              itemName="schedules"
            />
          )}
        </>
      )}
    </div>
  );
}

export default ScheduleClientSide;
