"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
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
  Course,
  EditScheduleFormData,
} from "@/app/types/course.type";
import { SessionOverview } from "@/app/types/session.type";

// Utils
import { generateConflictWarning, generateScheduleRows } from "@/lib/utils";

// Component imports
import EditScheduleDialog from "../../courses/schedule/class-schedule-confirm-edit";

interface ScheduleConfirmationDialogProps {
  course?: Pick<Course, "id" | "title">;
  classSchedule?: ComfirmClassScheduleData;
  teacherData?: TeacherData;
  students: Student[];
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  mode?: "create" | "assign";
  session?: SessionOverview; // Optional for assign mode
  // Package-related props
  isFromPackage?: boolean;
  packageId?: number;
}

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
  isFromPackage = false,
  packageId,
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
          if (process.env.NODE_ENV !== "production") {
            console.log("Checking row for conflicts:", row);
          }

          const [rowStartTime, rowEndTime] = row.time.split(" - ");

          const conflictCourse = conflicts.find((c) => {
            // Must be same date
            if (c.date !== row.date) {
              return false;
            }

            const toMinutes = (time: string) => {
              const [hours, minutes] = time.split(":").map(Number);
              return hours * 60 + minutes;
            };

            const rowStart = toMinutes(rowStartTime);
            const rowEnd = toMinutes(rowEndTime);
            const conflictStart = toMinutes(c.startTime);
            const conflictEnd = toMinutes(c.endTime);

            const hasTimeOverlap =
              rowStart < conflictEnd && conflictStart < rowEnd;

            // Check different conflict types
            if (c.conflictType === "room_student") {
              // Room AND student conflict - check room match AND time overlap
              return c.room === row.room && hasTimeOverlap;
            } else if (c.conflictType === "student") {
              // Student conflict only - check time overlap (room can be different)
              return hasTimeOverlap;
            } else if (c.conflictType === "room") {
              // Room conflict only - check room match AND time overlap
              return c.room === row.room && hasTimeOverlap;
            } else {
              // Fallback - any time overlap
              return hasTimeOverlap;
            }
          });

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
    if (process.env.NODE_ENV !== "production") {
      console.log("Row data:", row);
    }
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
      studentIdDisplay: student?.studentId || "",
      remark: row.remark,
      status: row.attendance,
    });

    setSelectedRowIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (
    editedData: EditScheduleFormData,
    originalIndex: number
  ) => {
    const updatedRows = [...scheduleRows];
    const startTime = editedData.starttime;
    const endTime = editedData.endtime;
    const date = normalizeDate(editedData.date);

    // Find the student to get the actual ID for API calls
    const student = students.find(
      (s) => s.studentId === editedData.studentId || s.id === editedData.studentId
    );

    if (process.env.NODE_ENV !== "production") {
      console.log("Checking conflict for edited data:", {
        date,
        startTime,
        endTime,
        room: editedData.room,
        teacherId: editedData.teacherId,
        studentId: Number(student?.id || editedData.studentId),
      });
    }

    try {
      const conflictCourse = await checkScheduleConflict({
        date,
        startTime,
        endTime,
        room: editedData.room,
        teacherId: editedData.teacherId ? Number(editedData.teacherId) : undefined,
        studentId: Number(student?.id || editedData.studentId),
      });

      updatedRows[originalIndex] = {
        ...updatedRows[originalIndex],
        date,
        time: `${startTime} - ${endTime}`,
        student: editedData.nickname || editedData.student,
        teacher: editedData.teacher,
        teacherId: editedData.teacherId ? Number(editedData.teacherId) : updatedRows[originalIndex].teacherId,
        room: editedData.room,
        remark: editedData.remark,
        attendance: editedData.status,
        warning: conflictCourse ? generateConflictWarning(conflictCourse) : "",
      };

      if (process.env.NODE_ENV !== "production") {
        console.log("Updated row data:", updatedRows[originalIndex]);
      }

      setScheduleRows(updatedRows);
      setEditDialogOpen(false);
      setSelectedRowData(null);
      setSelectedRowIndex(-1);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error checking conflict for edited schedule:", error);
      }
      // Still update the row even if conflict check fails
      updatedRows[originalIndex] = {
        ...updatedRows[originalIndex],
        date,
        time: `${startTime} - ${endTime}`,
        student: editedData.nickname || editedData.student,
        teacher: editedData.teacher,
        teacherId: editedData.teacherId ? Number(editedData.teacherId) : updatedRows[originalIndex].teacherId,
        room: editedData.room,
        remark: editedData.remark,
        attendance: editedData.status,
        warning: "Unable to check conflicts",
      };

      setScheduleRows(updatedRows);
      setEditDialogOpen(false);
      setSelectedRowData(null);
      setSelectedRowIndex(-1);
      
      showToast.error("Failed to check schedule conflicts, but changes were saved.");
    }
  };

  const handleConfirmSubmit = async () => {
    if (!course || !classSchedule || !teacherData) return;

    setIsSubmitting(true);

    const loadingMessage =
      mode === "assign"
        ? "Assigning course and creating schedules..."
        : "Creating sessions and schedules...";
    const toastId = showToast.loading(loadingMessage);

    try {
      const sessionsMap: Record<string, number> = {};

      if (mode === "assign" && session) {
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

        if (process.env.NODE_ENV !== "production") {
          console.log("Session updated successfully");
        }
      } else {
        // Mode: create - Create new sessions
        if (process.env.NODE_ENV !== "production") {
          console.log("=== Creating New Sessions and Schedules ===");
        }

        // Create a session for each student
        for (const student of students) {
          const newSession = await createSession({
            studentId: Number(student.id),
            courseId: course.id,
            teacherId:
              teacherData.teacherId === -1 ? undefined : teacherData.teacherId,
            classOptionId: Number(classSchedule.classType.id),
            classCancel: 0,
            payment: isFromPackage ? "Paid" : "Unpaid",
            status: "wip",
          });
          sessionsMap[student.id] = newSession.id;
        }
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
          teacherId: row.teacherId
            ? row.teacherId
            : teacherData.teacherId === -1
            ? undefined
            : teacherData.teacherId,
          date: row.date,
          startTime,
          endTime,
          room: row.room,
          remark: row.remark,
          attendance: row.attendance || "pending",
          feedback: "",
          verifyFb: false,
          classNumber: index + 1,
          warning: row.warning || "",
        };
      });

      // Send schedules to backend
      await createBulkSchedules(schedulePayload);

      showToast.dismiss(toastId);

      const successMessage =
        mode === "assign"
          ? `Successfully assigned ${course.title} to the session and created schedules!`
          : `Successfully created sessions and schedules for ${course.title}!`;

      showToast.success(successMessage);

      onConfirm();
      router.refresh();
    } catch (err) {
      console.error("Error in schedule confirmation:", err);
      const errorMessage =
        mode === "assign"
          ? "Failed to update session and create schedules. Check console for details."
          : "Failed to create sessions and schedules. Check console for details.";

      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!course || !classSchedule || !teacherData) {
    return null;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 pt-20 md:pt-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-500 mb-1">
            {mode === "assign"
              ? "Confirming Course Assignment & Schedule"
              : "Confirming Class Schedule"}
          </h1>
          <p className="text-base sm:text-lg text-gray-700 truncate">{course.title}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Double-click any row to edit the schedule
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 lg:flex-nowrap">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-gray-500 border-gray-500 hover:bg-gray-50 hover:text-gray-600 rounded-full px-4 sm:px-6 text-sm sm:text-base"
          >
            Back
          </Button>
          {/* <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-6"
          >
            Cancel
          </Button> */}
          <Button
            onClick={handleConfirmSubmit}
            className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-full px-4 sm:px-6 text-sm sm:text-base"
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

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border relative" style={{ maxWidth: '100vw' }}>
        <div className="overflow-x-auto">
          <Table className="min-w-max w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                  Date
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                  Time
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                  Student
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                  Teacher
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[80px]">
                  Room
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                  Remark
                </TableHead>
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[150px]">
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
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                    {row.date
                      ? new Date(row.date).toLocaleDateString("en-GB")
                      : "TBD"}
                  </TableCell>
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[120px]">
                    {row.time}
                  </TableCell>
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[120px]">
                    {row.student}
                  </TableCell>
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                    {row.teacher}
                  </TableCell>
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[80px]">
                    {row.room}
                  </TableCell>
                  <TableCell className="border h-30 text-center px-2 min-w-[120px] max-w-[200px]">
                    <div className="break-words whitespace-normal">{row.remark}</div>
                  </TableCell>
                  <TableCell className="border h-30 text-center text-red-500 px-2 min-w-[150px] max-w-[250px]">
                    <div className="break-words whitespace-normal" title={row.warning || ""}>
                      {row.warning}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
