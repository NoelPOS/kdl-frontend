import React from "react";
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
              <TableHead className="border h-30 text-center whitespace-normal hidden sm:table-cell">
                Profile
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Time
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Student
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold hidden md:table-cell">
                Teacher
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold hidden lg:table-cell">
                Course
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold hidden md:table-cell">
                Room
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold hidden sm:table-cell">
                Attendance
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold hidden lg:table-cell">
                Remark
              </TableHead>
              <TableHead className="border h-30 text-center font-semibold w-42 max-w-xs break-words whitespace-normal hidden xl:table-cell">
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
                  {session.schedule_date
                    ? new Date(session.schedule_date).toLocaleDateString(
                        "en-GB"
                      )
                    : "TBD"}
                </TableCell>
                <TableCell className="border h-30 hidden sm:table-cell text-center whitespace-normal">
                  <div className="flex items-center justify-center">
                    <Image
                      src={
                        session.student_profilePicture || "/default-profile.png"
                      }
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {`${session.schedule_startTime} - ${session.schedule_endTime}`}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {session.student_name}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal hidden md:table-cell">
                  {session.teacher_name || "TBD"}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal hidden lg:table-cell">
                  {session.course_title}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal hidden md:table-cell">
                  {session.schedule_room}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal hidden sm:table-cell">
                  {getAttendanceBadge(session.schedule_attendance)}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal hidden lg:table-cell">
                  {session.schedule_remark || ""}
                </TableCell>
                <TableCell className="border h-30 text-center text-red-500    w-42 max-w-xs break-words whitespace-normal hidden xl:table-cell">
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
