import React, { useCallback } from "react";
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

interface ScheduleTableProps {
  schedules: ClassSchedule[];
  handleRowDoubleClick: (session: ClassSchedule) => void;
}

function ScheduleTable({
  schedules,
  handleRowDoubleClick,
}: ScheduleTableProps) {
  // console.log("again", schedules);
  // Memoize the attendance badge to prevent unnecessary re-renders
  const getAttendanceBadge = useCallback(
    (attendance: string | null | undefined) => {
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
    },
    []
  );

  return (
    <>
      {/* <div className="text-2xl font-medium mb-4">
        Class Mode: {schedules[0].session_mode}{" "}
      </div> */}
      <Table className="bg-white table-fixed">
        <TableHeader>
          <TableRow className="">
            <TableHead className="border h-30 text-center whitespace-normal font-semibold">
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
              Class No
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
                {session.schedule_classNumber}
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
    </>
  );
}

export default ScheduleTable;
