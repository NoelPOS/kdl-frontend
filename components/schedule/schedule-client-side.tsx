"use client";

import React, { useState, useCallback, useEffect } from "react";
import EditSchedule from "./dialogs/edit-schedule-dialog";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import ScheduleTable from "./schedule-table";
import { formatDateLocal } from "@/lib/utils";
import { getFilteredSchedules, ScheduleFilter } from "@/lib/axio";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

function ScheduleClientSide() {
  const params = useSearchParams();
  const [open, setOpen] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedSession, setSelectedSession] = useState<FormData>();

  // Extract params values to variables for stable dependency array
  const paramsString = params.toString();

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
    const fetchSchedules = async () => {
      const currentPage = parseInt(params.get("page") || "1", 10);
      const filter: ScheduleFilter = {
        startDate: params.get("startDate") || undefined,
        endDate: params.get("endDate") || undefined,
        studentName: params.get("studentName") || undefined,
        teacherName: params.get("teacherName") || undefined,
        courseName: params.get("courseName") || undefined,
        attendanceStatus: params.get("attendanceStatus") || undefined,
        classStatus: params.get("classStatus") || undefined,
        room: params.get("room") || undefined,
        sessionMode: params.get("sessionMode") || undefined,
        sort: params.get("sort") || undefined,
      };
      // console.log("Fetching schedules with:", { filter, currentPage, limit: 10 });
      const data = await getFilteredSchedules(filter, currentPage, 10);
      console.log("Received data:", {
        schedulesCount: data.schedules?.length,
        pagination: data.pagination,
        data: data,
      });
      setSchedules(data.schedules);
      setPagination(data.pagination);
    };
    fetchSchedules();
  }, [params, paramsString]);

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
