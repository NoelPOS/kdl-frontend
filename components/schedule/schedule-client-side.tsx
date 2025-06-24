"use client";

import React, { useState, useCallback, useMemo } from "react";
import { getFilteredSchedules } from "@/lib/axio";
import EditSchedule from "./dialogs/edit-schedule-dialog";
import {
  ClassSchedule,
  FilterFormData,
  FormData,
} from "@/app/types/schedule.type";
import ScheduleFilter from "./schedule-filter";
import ScheduleTable from "./schedule-table";

interface ScheduleClientSideProps {
  initialSchedules: ClassSchedule[];
}

function ScheduleClientSide({ initialSchedules }: ScheduleClientSideProps) {
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<FormData>();
  const [isFiltered, setIsFiltered] = useState(false);
  const [originalSchedules, setOriginalSchedules] =
    useState<ClassSchedule[]>(initialSchedules);

  // Memoized filter handler to prevent unnecessary re-renders
  const handleFilter = useCallback(async (filterData: FilterFormData) => {
    if (
      !filterData.startDate ||
      !filterData.endDate ||
      !filterData.studentName
    ) {
      alert("Please fill in all filter fields");
      return;
    }

    setLoading(true);
    try {
      const filteredSchedules = await getFilteredSchedules({
        startDate: filterData.startDate,
        endDate: filterData.endDate,
        studentName: filterData.studentName,
      });
      setSchedules(filteredSchedules);
      setIsFiltered(true);
    } catch (error) {
      console.error("Failed to filter schedules:", error);
      alert("Failed to filter schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear filter function
  const handleClearFilter = useCallback(() => {
    setSchedules(originalSchedules);
    setIsFiltered(false);
  }, [originalSchedules]);

  // Handle schedule update
  const handleScheduleUpdate = useCallback((updatedSchedule: FormData) => {
    // Create the updated schedule object
    const updatedScheduleData = {
      schedule_date: updatedSchedule.date,
      schedule_startTime: updatedSchedule.starttime,
      schedule_endTime: updatedSchedule.endtime,
      schedule_room: updatedSchedule.room,
      schedule_remark: updatedSchedule.remark,
      schedule_attendance: updatedSchedule.status ?? "",
    };

    console.log("Updated schedule data:", updatedScheduleData);

    // Update current schedules - convert scheduleId to string for comparison
    setSchedules((prevSchedules) => {
      const updatedSchedules = prevSchedules.map((schedule) => {
        if (schedule.schedule_id == updatedSchedule.scheduleId.toString()) {
          console.log("Found matching schedule to update:", schedule);
          return { ...schedule, ...updatedScheduleData };
        }
        return schedule;
      });
      console.log("Updated schedules:", updatedSchedules);
      return updatedSchedules;
    });

    // Update original schedules (for when user clears filter)
    setOriginalSchedules((prevOriginalSchedules) => {
      const updatedOriginalSchedules = prevOriginalSchedules.map((schedule) => {
        if (schedule.schedule_id === updatedSchedule.scheduleId.toString()) {
          return { ...schedule, ...updatedScheduleData };
        }
        return schedule;
      });
      console.log("Updated original schedules:", updatedOriginalSchedules);
      return updatedOriginalSchedules;
    });
  }, []);

  const handleRowDoubleClick = useCallback((session: ClassSchedule) => {
    // Fix date conversion - remove the +24 hours adjustment
    const formData: FormData = {
      date: new Date(session.schedule_date).toISOString().split("T")[0],
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

  // Memoize the table component to prevent unnecessary re-renders
  const memoizedScheduleTable = useMemo(
    () => (
      <ScheduleTable
        schedules={schedules}
        handleRowDoubleClick={handleRowDoubleClick}
      />
    ),
    [schedules, handleRowDoubleClick]
  );

  return (
    <div>
      <ScheduleFilter
        onFilter={handleFilter}
        onClearFilter={handleClearFilter}
        isFiltered={isFiltered}
      />
      <EditSchedule
        open={open}
        onOpenChange={setOpen}
        initialData={selectedSession}
        onScheduleUpdate={handleScheduleUpdate}
      />

      {loading && (
        <div className="text-center py-4">
          <p>Loading schedules...</p>
        </div>
      )}

      {memoizedScheduleTable}
    </div>
  );
}

export default React.memo(ScheduleClientSide);
