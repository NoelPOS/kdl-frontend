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
import {
  createSession,
  createBulkSchedules,
  updateSession,
  checkScheduleConflicts,
  checkTeacherAvailability,
  checkScheduleConflict,
} from "@/lib/api";
import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  Student,
  TeacherData,
  EditScheduleFormData,
} from "@/app/types/course.type";
import { SessionOverview } from "@/app/types/session.type";
import { generateConflictWarning, generateScheduleRows } from "@/lib/utils";
import EditScheduleDialog from "@/components/entities/courses/schedule/class-schedule-confirm-edit";

interface Step5Props {
  courseId: number;
  courseTitle: string;
  classSchedule: ComfirmClassScheduleData;
  teacherData: TeacherData;
  students: Student[];
  mode: "create" | "assign";
  session?: SessionOverview;
  onSuccess: () => void;
}

export function Step5Confirm({
  courseId,
  courseTitle,
  classSchedule,
  teacherData,
  students,
  mode,
  session,
  onSuccess,
}: Step5Props) {
  const router = useRouter();
  const [scheduleRows, setScheduleRows] = useState<ComfirmScheduleRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [selectedRowData, setSelectedRowData] =
    useState<EditScheduleFormData | null>(null);

  // Generate schedule rows and check conflicts
  useEffect(() => {
    const init = async () => {
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

        const updatedRows = await Promise.all(
          rows.map(async (row) => {
            const [rowStartTime, rowEndTime] = row.time.split(" - ");
            const warnings: string[] = [];

            // Check teacher availability
            if (row.teacherId && row.date && rowStartTime && rowEndTime) {
              try {
                const availResult = await checkTeacherAvailability(
                  row.teacherId,
                  row.date,
                  rowStartTime,
                  rowEndTime
                );
                if (!availResult.available && availResult.reason) {
                  warnings.push(`Warning: ${availResult.reason}`);
                }
              } catch {
                // Silently skip
              }
            }

            // Check schedule conflicts
            const conflictCourse = conflicts.find((c) => {
              if (c.date !== row.date) return false;
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

              if (c.conflictType === "room_student") {
                return c.room === row.room && hasTimeOverlap;
              } else if (c.conflictType === "student") {
                return hasTimeOverlap;
              } else if (c.conflictType === "room") {
                return c.room === row.room && hasTimeOverlap;
              }
              return hasTimeOverlap;
            });

            if (conflictCourse) {
              warnings.push(generateConflictWarning(conflictCourse));
            }

            return { ...row, warning: warnings.join(" | ") };
          })
        );

        setScheduleRows(updatedRows);
      } catch {
        // Fallback without conflict checking
        const rows = generateScheduleRows(students, classSchedule, teacherData);
        setScheduleRows(rows);
      }
    };

    init();
  }, [students, classSchedule, teacherData]);

  const normalizeDate = (d?: string) => {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return "";
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const d = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      );
      return d.toLocaleDateString("en-GB");
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime())
      ? dateStr
      : parsed.toLocaleDateString("en-GB");
  };

  const handleRowDoubleClick = (row: ComfirmScheduleRow, index: number) => {
    const student = students.find(
      (s) => s.nickname === row.student || s.name === row.student
    );
    const [startTime, endTime] = row.time.split(" - ");

    setSelectedRowData({
      date: row.date,
      starttime: startTime,
      endtime: endTime,
      course: courseTitle,
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
    const student = students.find(
      (s) =>
        s.studentId === editedData.studentId || s.id === editedData.studentId
    );

    try {
      const conflictCourse = await checkScheduleConflict({
        date,
        startTime,
        endTime,
        room: editedData.room,
        teacherId: editedData.teacherId
          ? Number(editedData.teacherId)
          : undefined,
        studentId: Number(student?.id || editedData.studentId),
      });

      updatedRows[originalIndex] = {
        ...updatedRows[originalIndex],
        date,
        time: `${startTime} - ${endTime}`,
        student: editedData.nickname || editedData.student,
        teacher: editedData.teacher,
        teacherId: editedData.teacherId
          ? Number(editedData.teacherId)
          : updatedRows[originalIndex].teacherId,
        room: editedData.room,
        remark: editedData.remark,
        attendance: editedData.status,
        warning: conflictCourse
          ? generateConflictWarning(conflictCourse)
          : "",
      };
    } catch {
      updatedRows[originalIndex] = {
        ...updatedRows[originalIndex],
        date,
        time: `${startTime} - ${endTime}`,
        student: editedData.nickname || editedData.student,
        teacher: editedData.teacher,
        teacherId: editedData.teacherId
          ? Number(editedData.teacherId)
          : updatedRows[originalIndex].teacherId,
        room: editedData.room,
        remark: editedData.remark,
        attendance: editedData.status,
        warning: "Unable to check conflicts",
      };
    }

    setScheduleRows(updatedRows);
    setEditDialogOpen(false);
    setSelectedRowData(null);
    setSelectedRowIndex(-1);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    const toastId = showToast.loading(
      mode === "assign"
        ? "Assigning course and creating schedules..."
        : "Creating sessions and schedules..."
    );

    try {
      const sessionsMap: Record<string, number> = {};

      if (mode === "assign" && session) {
        await updateSession(session.sessionId, {
          courseId,
          teacherId: teacherData.teacherId,
          classOptionId: classSchedule.classType.id,
        });
        students.forEach((student) => {
          sessionsMap[student.id] = session.sessionId;
        });
      } else {
        for (const student of students) {
          const newSession = await createSession({
            studentId: Number(student.id),
            courseId,
            teacherId:
              teacherData.teacherId === -1
                ? undefined
                : teacherData.teacherId,
            classOptionId: Number(classSchedule.classType.id),
            classCancel: 0,
            payment: "Unpaid",
            status: "wip",
          });
          sessionsMap[student.id] = newSession.id;
        }
      }

      const schedulePayload = scheduleRows.map((row, index) => {
        const [startTime, endTime] = row.time.split(" - ");
        const student = students.find(
          (s) => s.nickname === row.student || s.name === row.student
        );
        return {
          sessionId: sessionsMap[student!.id],
          courseId,
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

      await createBulkSchedules(schedulePayload);

      showToast.dismiss(toastId);
      showToast.success(
        mode === "assign"
          ? `Successfully assigned ${courseTitle} and created schedules!`
          : `Successfully created sessions and schedules for ${courseTitle}!`
      );

      onSuccess();
      router.refresh();
    } catch (err) {
      console.error("Error in schedule confirmation:", err);
      showToast.dismiss(toastId);
      showToast.error(
        mode === "assign"
          ? "Failed to update session and create schedules."
          : "Failed to create sessions and schedules."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Confirm & Submit
        </h3>
        <p className="text-sm text-muted-foreground">
          Review the generated schedule. Double-click any row to edit.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <span className="text-muted-foreground">Course</span>
          <p className="font-medium">{courseTitle}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <span className="text-muted-foreground">Class Type</span>
          <p className="font-medium">{classSchedule.classType.classMode}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <span className="text-muted-foreground">Teacher</span>
          <p className="font-medium">{teacherData.teacher || "TBD"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <span className="text-muted-foreground">Room</span>
          <p className="font-medium">{teacherData.room || "TBD"}</p>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[var(--shadow-sm)] border border-gray-200">
        <Table className="min-w-max w-full">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[100px]">
                Date
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[120px]">
                Time
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[120px]">
                Student
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[100px]">
                Teacher
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[80px]">
                Room
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[120px]">
                Remark
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap font-semibold min-w-[150px]">
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
                <TableCell className="border text-center whitespace-nowrap px-2">
                  {formatDateDisplay(row.date)}
                </TableCell>
                <TableCell className="border text-center whitespace-nowrap px-2">
                  {row.time}
                </TableCell>
                <TableCell className="border text-center whitespace-nowrap px-2">
                  {row.student}
                </TableCell>
                <TableCell className="border text-center whitespace-nowrap px-2">
                  {row.teacher}
                </TableCell>
                <TableCell className="border text-center whitespace-nowrap px-2">
                  {row.room}
                </TableCell>
                <TableCell className="border text-center px-2 max-w-[200px]">
                  <div className="break-words whitespace-normal">
                    {row.remark}
                  </div>
                </TableCell>
                <TableCell className="border text-center text-red-500 px-2 max-w-[250px]">
                  <div
                    className="break-words whitespace-normal"
                    title={row.warning || ""}
                  >
                    {row.warning}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleConfirmSubmit}
        className="w-full bg-yellow-500 text-white hover:bg-yellow-600 rounded-xl py-3 text-base font-medium shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all"
        disabled={isSubmitting || scheduleRows.length === 0}
      >
        {isSubmitting
          ? "Processing..."
          : mode === "assign"
          ? "Assign & Create Schedules"
          : "Confirm Enrollment"}
      </Button>

      <EditScheduleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={selectedRowData || undefined}
        onSave={handleSaveEdit}
        originalIndex={selectedRowIndex}
        courseId={courseId}
        courseName={courseTitle}
      />
    </div>
  );
}
