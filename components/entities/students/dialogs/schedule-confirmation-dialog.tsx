"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// API imports
import {
  updateSession,
  createSession,
  createBulkSchedules,
  checkScheduleConflict,
  checkScheduleConflicts,
} from "@/lib/api";

// Types
import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  Student,
  TeacherData,
  ConflictDetail,
  Course,
  EditScheduleFormData,
} from "@/app/types/course.type";
import { SessionOverview } from "@/app/types/session.type";

// Utils
import { generateScheduleRows } from "@/lib/utils";

// Component imports
import EditScheduleDialog from "../../courses/schedule/class-schedule-confirm-edit";

interface ScheduleConfirmationDialogProps {
  course?: Course;
  classSchedule?: ComfirmClassScheduleData;
  teacherData?: TeacherData;
  students: Student[];
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  mode?: "create" | "assign";
  session?: SessionOverview; // Optional for assign mode
}

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

export default function ScheduleConfirmationDialog({
  course,
  classSchedule,
  teacherData,
  students,
  onConfirm,
  onBack,
  onCancel,
  mode = "create",
  session,
}: ScheduleConfirmationDialogProps) {
  const router = useRouter();
  const [scheduleRows, setScheduleRows] = useState<ComfirmScheduleRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [selectedRowData, setSelectedRowData] =
    useState<EditScheduleFormData | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!classSchedule || !teacherData) return;

      try {
        const rows = generateScheduleRows(students, classSchedule, teacherData);

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
        // Fallback without conflict checking
        if (classSchedule && teacherData) {
          const rows = generateScheduleRows(
            students,
            classSchedule,
            teacherData
          );
          setScheduleRows(rows);
        }
      }
    };

    init();
  }, [students, classSchedule, teacherData]);

  const normalizeDate = (d?: string) => {
    const parsed = new Date(d ?? "");
    return parsed.toLocaleDateString();
  };

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
      course: course?.title || "",
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

  const handleConfirmSubmit = async () => {
    if (!course || !classSchedule || !teacherData) return;

    setIsSubmitting(true);

    try {
      const sessionsMap: Record<string, number> = {};

      if (mode === "assign" && session) {
        // Mode: assign - Update existing session
        console.log("=== Updating Session and Creating Schedules ===");
        console.log("Session ID:", session.sessionId);
        console.log("Course:", course);
        console.log("Teacher:", teacherData);
        console.log("Class Schedule:", classSchedule);

        // Update the existing session with new course details
        await updateSession(session.sessionId, {
          courseId: course.id,
          teacherId: teacherData.teacherId,
          classOptionId: classSchedule.classType.id,
        });

        // Use existing session for all students (assuming single student in assign mode)
        students.forEach((student) => {
          sessionsMap[student.id] = session.sessionId;
        });

        console.log("Session updated successfully");
      } else {
        // Mode: create - Create new sessions
        console.log("=== Creating New Sessions and Schedules ===");

        // Create a session for each student
        for (const student of students) {
          const newSession = await createSession({
            studentId: Number(student.id),
            courseId: course.id,
            teacherId:
              teacherData.teacherId === -1 ? undefined : teacherData.teacherId,
            classOptionId: Number(classSchedule.classType.id),
            classCancel: 0,
            payment: "Unpaid",
            status: "Pending",
            isFromPackage: false,
          });
          sessionsMap[student.id] = newSession.id;
        }

        console.log("Sessions created successfully");
      }

      // Create schedule entries for both modes
      const schedulePayload = scheduleRows.map((row, index) => {
        const [startTime, endTime] = row.time.split(" - ");
        const student = students.find(
          (s) => s.nickname === row.student || s.name === row.student
        );

        return {
          sessionId: sessionsMap[student!.id],
          courseId: course.id,
          studentId: Number(student!.id),
          teacherId:
            teacherData.teacherId === -1 ? undefined : teacherData.teacherId,
          date: row.date,
          startTime,
          endTime,
          room: row.room,
          remark: row.remark,
          attendance: "pending",
          feedback: "",
          verifyFb: false,
          classNumber: index + 1,
          warning: row.warning || "",
        };
      });

      console.log("Schedule Payload:", schedulePayload);

      // Send schedules to backend
      await createBulkSchedules(schedulePayload);

      console.log("Schedules created successfully");

      const successMessage =
        mode === "assign"
          ? `Successfully assigned ${course.title} to the session and created schedules!`
          : `Successfully created sessions and schedules for ${course.title}!`;

      alert(successMessage);

      onConfirm();
      router.refresh();
    } catch (err) {
      console.error("Error in schedule confirmation:", err);
      const errorMessage =
        mode === "assign"
          ? "Failed to update session and create schedules. Check console for details."
          : "Failed to create sessions and schedules. Check console for details.";

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!course || !classSchedule || !teacherData) {
    return null;
  }

  return (
    <div className="py-6 px-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-500 mb-1">
            {mode === "assign"
              ? "Confirming Course Assignment & Schedule"
              : "Confirming Class Schedule"}
          </h1>
          <p className="text-lg text-gray-700">{course.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            Double-click any row to edit the schedule
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-gray-500 border-gray-500 hover:bg-gray-50 hover:text-gray-600 rounded-full px-6"
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6"
            disabled={isSubmitting || scheduleRows.length === 0}
          >
            {isSubmitting
              ? "Processing..."
              : mode === "assign"
              ? "Assign & Create Schedules"
              : "Confirm"}
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
        courseName={course?.title || ""}
      />
    </div>
  );
}
