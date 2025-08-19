"use client";

import { useState, useEffect } from "react";
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
  Package2,
  User,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { Package } from "@/app/types/package.type";
import {
  Course,
  TeacherData,
  Student,
  ConflictDetail,
} from "@/app/types/course.type";
import { checkScheduleConflicts } from "@/lib/api";
import { DAYS_OF_WEEK, formatDateLocal } from "@/lib/utils";

interface PackageScheduleData {
  classMode: string;
  dates: string[];
  startTime: string;
  endTime: string;
  days?: string[];
}

interface ScheduleRow {
  date: string;
  time: string;
  room: string;
  teacher: string;
  student: string;
  warning?: string;
}

interface PackageConfirmationProps {
  package: Package;
  course: Course;
  schedule: PackageScheduleData;
  teacher: TeacherData | null;
  student: Student;
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
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

export function PackageConfirmation({
  package: pkg,
  course,
  schedule,
  teacher,
  student,
  onConfirm,
  onBack,
  onCancel,
}: PackageConfirmationProps) {
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConflicts, setHasConflicts] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Generate schedule rows based on package type and check for conflicts
  useEffect(() => {
    const generateScheduleRows = async () => {
      if (!teacher || !schedule.startTime || !schedule.endTime) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const rows: ScheduleRow[] = [];

        if (schedule.classMode.includes("fixed") && schedule.days) {
          // For fixed sessions, generate dates based on selected days
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(today.getMonth() + 3); // Generate for next 3 months

          for (
            let date = new Date(today);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const dayOfWeek = DAYS_OF_WEEK.find(
              (d) => d.dayIndex === date.getDay()
            );
            if (dayOfWeek && schedule.days.includes(dayOfWeek.key)) {
              rows.push({
                date: formatDateLocal(date),
                time: `${formatTime(schedule.startTime)} - ${formatTime(
                  schedule.endTime
                )}`,
                room: teacher.room,
                teacher: teacher.teacher,
                student: student.nickname || student.name,
              });
            }
          }
        } else {
          // For camp/flexible, use selected dates
          schedule.dates.forEach((date) => {
            rows.push({
              date,
              time: `${formatTime(schedule.startTime)} - ${formatTime(
                schedule.endTime
              )}`,
              room: teacher.room,
              teacher: teacher.teacher,
              student: student.nickname || student.name,
            });
          });
        }

        // Check for conflicts
        const formattedSchedules = rows.map((row) => ({
          date: row.date,
          room: row.room,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacherId: teacher.teacherId,
          studentId: Number(student.id),
        }));

        const conflicts = await checkScheduleConflicts({
          schedules: formattedSchedules,
        });

        // Add conflict warnings to rows
        const updatedRows = rows.map((row) => {
          const conflictCourse = conflicts.find(
            (c) =>
              c.date === row.date &&
              c.room === row.room &&
              c.startTime === schedule.startTime
          );

          return {
            ...row,
            warning: conflictCourse
              ? generateConflictWarning(conflictCourse)
              : "",
          };
        });

        setScheduleRows(updatedRows);
        setHasConflicts(conflicts.length > 0);
      } catch (error) {
        console.error("Failed to check schedule conflicts:", error);
        // Generate rows without conflict checking
        const rows: ScheduleRow[] = [];
        if (schedule.classMode.includes("fixed") && schedule.days) {
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(today.getMonth() + 3);

          for (
            let date = new Date(today);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const dayOfWeek = DAYS_OF_WEEK.find(
              (d) => d.dayIndex === date.getDay()
            );
            if (dayOfWeek && schedule.days.includes(dayOfWeek.key)) {
              rows.push({
                date: formatDateLocal(date),
                time: `${formatTime(schedule.startTime)} - ${formatTime(
                  schedule.endTime
                )}`,
                room: teacher.room,
                teacher: teacher.teacher,
                student: student.nickname || student.name,
              });
            }
          }
        } else {
          schedule.dates.forEach((date) => {
            rows.push({
              date,
              time: `${formatTime(schedule.startTime)} - ${formatTime(
                schedule.endTime
              )}`,
              room: teacher.room,
              teacher: teacher.teacher,
              student: student.nickname || student.name,
            });
          });
        }
        setScheduleRows(rows);
      } finally {
        setLoading(false);
      }
    };

    generateScheduleRows();
  }, [schedule, teacher, student]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Step 4: Confirm Package Application
        </h3>
        <p className="text-sm text-gray-600">
          Review all details and schedule preview before applying the package
        </p>
      </div>

      <div className="space-y-6">
        {/* Package Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 flex items-center gap-2 mb-3">
            <Package2 className="h-4 w-4" />
            Package Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-yellow-700 font-medium">Package:</span>
              <div className="text-yellow-800">{pkg.classOptionTitle}</div>
            </div>
            <div>
              <span className="text-yellow-700 font-medium">Fee:</span>
              <div className="text-yellow-800">${pkg.tuitionFee}</div>
            </div>
            <div>
              <span className="text-yellow-700 font-medium">Class Mode:</span>
              <div className="text-yellow-800">{pkg.classMode}</div>
            </div>
            <div>
              <span className="text-yellow-700 font-medium">Student:</span>
              <div className="text-yellow-800">{pkg.studentName}</div>
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4" />
            Course Details
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Course:</span>
              <div className="text-blue-800">{course.title}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Age Range:</span>
              <span className="text-blue-800 ml-2">{course.ageRange}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Medium:</span>
              <span className="text-blue-800 ml-2">{course.medium}</span>
            </div>
          </div>
        </div>

        {/* Teacher & Room Information */}
        {teacher && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              Teacher & Venue
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-purple-700 font-medium">Teacher:</span>
                <span className="text-purple-800 ml-2">{teacher.teacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700 font-medium">Room:</span>
                <span className="text-purple-800">{teacher.room}</span>
              </div>
              {teacher.remark && (
                <div>
                  <span className="text-purple-700 font-medium">Notes:</span>
                  <div className="text-purple-800 mt-1">{teacher.remark}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" />
            Schedule Preview
          </h4>

          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Checking for conflicts and generating schedule...
            </div>
          ) : scheduleRows.length > 0 ? (
            <>
              {hasConflicts && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      Schedule Conflicts Detected
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Some sessions have scheduling conflicts. Review the table
                    below for details.
                  </p>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleRows.slice(0, 20).map((row, index) => (
                      <TableRow
                        key={index}
                        className={row.warning ? "bg-red-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>{row.room}</TableCell>
                        <TableCell>{row.teacher}</TableCell>
                        <TableCell>{row.student}</TableCell>
                        <TableCell>
                          {row.warning ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">{row.warning}</span>
                            </div>
                          ) : (
                            <span className="text-blue-600 text-xs">
                            <span className="text-blue-600 text-xs">
                              Available
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {scheduleRows.length > 20 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Showing first 20 sessions. Total: {scheduleRows.length}{" "}
                  sessions.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No schedule data available
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-orange-900 mb-1">Important</h5>
              <p className="text-sm text-orange-800">
                Once confirmed, this package will be marked as &quot;used&quot;
                and new sessions will be created. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 ${
            hasConflicts
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          } text-white`}
        >
          {hasConflicts ? "Apply Despite Conflicts" : "Apply Package"}
        </Button>
      </div>
    </div>
  );
}
