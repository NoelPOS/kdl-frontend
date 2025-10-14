"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import { useAuth } from "@/context/auth.context";
import { UserRole } from "@/app/types/auth.type";
import RoleAwareScheduleTable from "../tables/role-aware-schedule-table";
import { formatDateLocal } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { ScheduleDownloadButton } from "../buttons/schedule-download-button";
import { SchedulePDFDownloadButton } from "../buttons/schedule-pdf-download-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type ViewMode = "view1" | "view2";

function ScheduleClientSide({
  initialSchedules = [],
  initialPagination,
}: ScheduleClientSideProps) {
  const { user } = useAuth();
  const params = useSearchParams();
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
  const [viewMode, setViewMode] = useState<ViewMode>("view1");

  useEffect(() => {
    // Set initial data when component mounts
    if (initialSchedules.length > 0) {
      setSchedules(initialSchedules);
    }
    if (initialPagination) {
      setPagination(initialPagination);
    }
  }, [initialSchedules, initialPagination]);

  const handleScheduleUpdate = useCallback((updatedFormData: FormData) => {
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
              schedule_feedback: updatedFormData.feedback || "", 
              schedule_attendance: updatedFormData.status || "",
            }
          : s
      )
    );
  }, []);

  // Default to ADMIN role if user is not available (shouldn't happen in practice)
  const userRole = user?.role || UserRole.ADMIN;

  return (
    <div className="w-full min-w-0">
      {params.size > 0 && (
        <>
          {/* Controls section */}
          {schedules.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              {/* View Mode Filter */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view1">View 1</SelectItem>
                    <SelectItem value="view2">View 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2">
                <SchedulePDFDownloadButton
                  schedules={schedules}
                  currentPage={pagination.currentPage}
                />
                <ScheduleDownloadButton
                  schedules={schedules}
                  currentPage={pagination.currentPage}
                />
              </div>
            </div>
          )}          
          <RoleAwareScheduleTable
            schedules={schedules}
            userRole={userRole}
            showStudentHeader={false}
            onScheduleUpdate={handleScheduleUpdate}
            viewMode={viewMode}
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
