import React, { useCallback, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClassSchedule } from "@/app/types/schedule.type";
import Image from "next/image";

const getAttendanceBadge = (attendance: string | null | undefined) => {
  if (!attendance) return null;

  const badgeClass =
    attendance === "completed"
      ? "bg-green-100 text-green-800"
      : attendance === "absent"
      ? "bg-red-100 text-red-800"
      : attendance === "confirmed"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";

  return <Badge className={badgeClass}>{attendance}</Badge>;
};

interface ScheduleTableProps {
  schedules: ClassSchedule[];
  handleRowDoubleClick: (session: ClassSchedule) => void;
}

function ScheduleTable({
  schedules,
  handleRowDoubleClick,
}: ScheduleTableProps) {
  return (
    <>
      {schedules.length > 0 ? (
        <Table className="bg-white table-fixed mb-10">
          <TableHeader>
            <TableRow className="">
              <TableHead className="border h-30 text-center whitespace-normal">
                Date
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Time
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Student
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Teacher
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Course
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Room
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Attendance
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Remark
              </TableHead>
              <TableHead className="border h-30 text-center font-semibold w-42 max-w-xs break-words whitespace-normal">
                Warning
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((session: ClassSchedule) => (
              <TableRow
                key={session.schedule_id}
                onDoubleClick={() => handleRowDoubleClick(session)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                title="Double-click to edit"
              >
                <TableCell className="border h-30 text-center whitespace-normal">
                  {new Date(session.schedule_date).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {`${session.schedule_startTime} - ${session.schedule_endTime}`}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.student_name}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.teacher_name}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.course_title}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.schedule_room}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {getAttendanceBadge(session.schedule_attendance)}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.schedule_remark || ""}
                </TableCell>
                <TableCell className="border h-30 text-center text-red-500    w-42 max-w-xs break-words whitespace-normal">
                  {session.schedule_warning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <Image
            src="/globe.svg"
            alt="No schedules"
            width={120}
            height={120}
            className="mb-6 opacity-80"
          />
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">
            No schedules found!
          </h2>
        </div>
      )}
    </>
  );
}

export default ScheduleTable;
