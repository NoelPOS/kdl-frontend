"use client";

import { useEffect, useState } from "react";

// shadcn imports
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// api call imports
import {
  createSession,
  createBulkSchedules,
  checkScheduleConflict,
  checkScheduleConflicts,
} from "@/lib/api";

// component import
import EditScheduleDialog from "./class-schedule-confirm-edit";

// helper functions
import { generateScheduleRows } from "@/lib/utils";

// type imports
import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  Student,
  TeacherData,
  ConflictDetail,
  Course,
  EditScheduleFormData,
} from "@/app/types/course.type";
import { useRouter, useSearchParams } from "next/navigation";

interface ClassScheduleConfirmProps {
  courseName: string;
  course?: Pick<Course, "id" | "title">;
  students: Student[];
  classSchedule: ComfirmClassScheduleData;
  teacherData: TeacherData;
  onCancel: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  // Package-related props
  isFromPackage?: boolean;
  packageId?: number;
}

const normalizeDate = (d?: string) => {
  const parsed = new Date(d ?? "");
  return parsed.toLocaleDateString();
};

// Helper function to generate conflict warning message
const generateConflictWarning = (conflict: ConflictDetail) => {
  const { conflictType, courseTitle, teacherName, studentName } = conflict;

  switch (conflictType) {
    case "room":
      return `Room conflict with ${courseTitle}`;
    case "teacher":
      return `Teacher conflict with ${teacherName}`;
    case "student":
      return `Student conflict with ${studentName} in ${courseTitle}`;
    case "room_teacher":
      return `Room and teacher conflict with ${courseTitle} / ${teacherName}`;
    case "room_student":
      return `Room and student conflict with ${courseTitle} / ${studentName}`;
    case "teacher_student":
      return `Teacher and student conflict with ${teacherName} / ${studentName} in ${courseTitle}`;
    case "all":
      return `Room, teacher, and student conflict with ${courseTitle} / ${teacherName} / ${studentName}`;
    default:
      return `Conflict with ${courseTitle}`;
  }
};

export default function ClassScheduleConfirm({
  courseName,
  course,
  students,
  classSchedule,
  teacherData,
  onConfirm,
  onCancel,
  onBack,
  isFromPackage = false,
  packageId,
}: ClassScheduleConfirmProps) {
  const router = useRouter();

  const [scheduleRows, setScheduleRows] = useState<ComfirmScheduleRow[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [selectedRowData, setSelectedRowData] =
    useState<EditScheduleFormData | null>(null);

  useEffect(() => {
    const init = async () => {
      const rows = generateScheduleRows(students, classSchedule, teacherData);

      try {
        const formattedSchedules = rows.map((row) => {
          const [startTime, endTime] = row.time.split(" - ");
          return {
            date: row.date,
            room: row.room,
            startTime,
            endTime,
            teacherId: row.teacherId,
            studentId: row.studentId,
          };
        });
        const conflicts = await checkScheduleConflicts({
          schedules: formattedSchedules,
        });

        // console.log("Conflicts", conflicts);

        const updatedRows = rows.map((row) => {
          const conflictCourse = conflicts.find(
            (c) =>
              c.date === row.date &&
              c.room === row.room &&
              row.time.includes(c.startTime)
          );

          return {
            ...row,
            warning: conflictCourse
              ? generateConflictWarning(conflictCourse)
              : "",
          };
        });

        setScheduleRows(updatedRows);
      } catch (err) {
        console.error("Failed to check schedule conflicts", err);
        setScheduleRows(rows);
      }
    };

    init();
  }, [students, classSchedule, teacherData]);

  const handleRowDoubleClick = (row: ComfirmScheduleRow, index: number) => {
    const student = students.find(
      (s) => s.nickname === row.student || s.name === row.student
    );
    console.log("Row data:", row);
    const [startTime, endTime] = row.time.split(" - ");

    setSelectedRowData({
      date: row.date,
      starttime: startTime,
      endtime: endTime,
      course: courseName || "",
      teacher: row.teacher,
      teacherId: row.teacherId,
      student: row.student,
      room: row.room,
      nickname: student?.nickname || "",
      studentId: student?.id || "",
      remark: row.remark,
      status: "Pending",
    });

    setSelectedRowIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (
    editedData: EditScheduleFormData,
    originalIndex: number
  ) => {
    console.log("Saving edited data:", editedData);
    const updatedRows = [...scheduleRows];

    const startTime = editedData.starttime;
    const endTime = editedData.endtime;
    const date = normalizeDate(editedData.date);

    const conflictCourse = await checkScheduleConflict({
      date,
      startTime,
      endTime,
      room: editedData.room,
      teacherId: editedData.teacherId,
      studentId: Number(editedData.studentId),
    });

    updatedRows[originalIndex] = {
      ...updatedRows[originalIndex],
      date,
      time: `${startTime} - ${endTime}`,
      student: editedData.nickname || editedData.student,
      teacher: editedData.teacher,
      room: editedData.room,
      remark: editedData.remark,
      warning: conflictCourse ? generateConflictWarning(conflictCourse) : "",
    };

    setScheduleRows(updatedRows);
    setEditDialogOpen(false);
    setSelectedRowData(null);
    setSelectedRowIndex(-1);
  };

  // Connect to Backend
  const handleConfirmSubmit = async () => {
    try {
      const sessionsMap: Record<string, number> = {};

      // 1. Create a session for each student
      for (const student of students) {
        const session = await createSession({
          studentId: Number(student.id),
          courseId: course?.id || -1,
          teacherId:
            teacherData.teacherId == -1 ? undefined : teacherData.teacherId,
          classOptionId: Number(classSchedule.classType.id),
          classCancel: 0,
          payment: isFromPackage ? "Paid" : "Unpaid",
          status: "Pending",
          isFromPackage: isFromPackage,
          packageId: packageId,
        });
        sessionsMap[student.id] = session.id;
      }

      // 2. Prepare schedule entries
      const schedulePayload = scheduleRows.map((row) => {
        const [startTime, endTime] = row.time.split(" - ");
        const student = students.find(
          (s) => s.nickname === row.student || s.name === row.student
        );

        return {
          sessionId: sessionsMap[student!.id],
          courseId: course?.id || -1,
          studentId: Number(student!.id),
          teacherId:
            teacherData.teacherId == -1 ? undefined : teacherData.teacherId,
          date: row.date,
          startTime,
          endTime,
          room: row.room,
          remark: row.remark,
          attendance: "pending",
          feedback: "",
          verifyFb: false,
          classNumber: row.class,
          warning: row.warning || "",
        };
      });

      console.log("Schedule Payload:", schedulePayload);

      // 3. Send to backend
      await createBulkSchedules(schedulePayload);
      onConfirm();

      router.refresh();
    } catch (err) {
      console.error("Error confirming schedule:", err);
      alert("Failed to confirm schedule. Check console.");
    }
  };

  return (
    <div className="py-6 px-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-500 mb-1">
            Confirming Class Schedule
          </h1>
          <p className="text-lg text-gray-700">{course?.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            Double-click any row to edit the schedule
          </p>
        </div>
        <div className="flex gap-3">
          {/* {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="text-gray-500 border-gray-500 hover:bg-gray-50 hover:text-gray-600 rounded-full px-6"
            >
              Back
            </Button>
          )} */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6"
          >
            Confirm
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table className="bg-white table-fixed">
          <TableHeader>
            <TableRow className="bg-gray-50">
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
                Room
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Remark
              </TableHead>
              <TableHead className="border h-30 text-center whitespace-normal font-semibold">
                Warning
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleRows.map((row, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50 cursor-pointer"
                onDoubleClick={() => handleRowDoubleClick(row, index)}
              >
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.date
                    ? new Date(row.date).toLocaleDateString("en-GB")
                    : "TBD"}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.time}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.student}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.teacher}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.room}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal">
                  {row.remark}
                </TableCell>
                <TableCell className="border h-30 text-center whitespace-normal text-red-500 text-sm">
                  {row.warning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditScheduleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={selectedRowData || undefined}
        onSave={handleSaveEdit}
        originalIndex={selectedRowIndex}
        courseId={course?.id || -1}
        courseName={courseName}
      />
    </div>
  );
}
