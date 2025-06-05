"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ComfirmClassScheduleData,
  ComfirmStudent,
  ComfirmTeacherData,
} from "@/lib/types";
import { generateScheduleRows } from "@/lib/utils";

interface ClassScheduleConfirmProps {
  students: ComfirmStudent[];
  classSchedule: ComfirmClassScheduleData;
  teacherData: ComfirmTeacherData;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClassScheduleConfirm({
  students,
  classSchedule,
  teacherData,
  onCancel,
  onConfirm,
}: ClassScheduleConfirmProps) {
  // Get course name from URL params
  const courseName =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("course") || "Course"
      : "Course";

  // Generate formatted schedule rows based on the provided data
  const scheduleRows = generateScheduleRows(
    students,
    classSchedule,
    teacherData
  );

  return (
    <div className="py-6 px-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-500 mb-1">
            Confirming Class Schedule
          </h1>
          <p className="text-lg text-gray-700">{courseName}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-500 text-white hover:bg-green-600 rounded-full px-6"
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="border rounded-lg  bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Time
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Student
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Teacher
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Class
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Room
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Remark
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center h-20">
                Warning
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleRows.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="border-r text-center h-20">
                  {row.date}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.time}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.student}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.teacher}
                </TableCell>
                <TableCell className="border-r text-center h-20 ">
                  {row.class}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.room}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.remark}
                </TableCell>
                <TableCell className="max-w-[150px] text-center h-20">
                  {row.warning && (
                    <span className="text-red-500 text-sm text-wrap">
                      {row.warning}{" "}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Info */}
      {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Students: </span>
            <span className="text-gray-600">
              {students.map((s) => s.nickname || s.studentName).join(", ")}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Class Type: </span>
            <span className="text-gray-600 capitalize">
              {classSchedule.classType?.replace("-", " ")}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">
              Total Sessions:{" "}
            </span>
            <span className="text-gray-600">
              {classSchedule.classType === "12-times-check" ||
              classSchedule.classType === "12-times-fixed"
                ? "12"
                : classSchedule.campSessions?.length || 0}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default ClassScheduleConfirm;
