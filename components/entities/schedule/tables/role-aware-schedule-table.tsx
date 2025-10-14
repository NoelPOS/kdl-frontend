"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import { UserRole } from "@/app/types/auth.type";
import { showToast } from "@/lib/toast";
import Image from "next/image";
import EditSchedule from "../dialogs/edit-schedule-dialog";
import FreeTrialEditDialog from "../dialogs/free-trial-edit-dialog";
import TeacherEditScheduleDialog from "@/components/entities/sessions/dialogs/teacher-edit-schedule-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, User, BookOpen, Calendar, Check, X, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateSchedule } from "@/lib/api";
import AttendanceConfirmationDialog from "../dialogs/attendance-confirmation-dialog";
import { vi } from "date-fns/locale";

const getAttendanceBadge = (attendance: string | null | undefined) => {
  if (!attendance) return null;

  const badgeClass =
    attendance === "completed" || attendance === "present"
      ? "bg-[#52c41a] text-[#ffffff]"
      : attendance === "cancelled"
      ? "bg-red-500 text-[#ffffff]"
      : attendance === "confirmed"
      ? "bg-[#1890ff] text-[#ffffff]"
      : attendance === "pending"
      ? "bg-[#faad14] text-[#ffffff]"
      : "bg-gray-100 text-gray-800";

  return <Badge className={badgeClass}>{attendance}</Badge>;
};

type ViewMode = "view1" | "view2";

interface RoleAwareScheduleTableProps {
  schedules: ClassSchedule[];
  userRole: UserRole;
  showStudentHeader?: boolean; // true for student detail page, false for general schedule page
  onScheduleUpdate?: (schedule: FormData) => void;
  hideCourseInfo?: boolean; // true for today page, false for other pages
  shouldRefreshOnUpdate?: boolean;
  viewMode?: ViewMode; // New prop for view mode
}

export default function RoleAwareScheduleTable({
  schedules,
  userRole,
  showStudentHeader = true,
  onScheduleUpdate,
  hideCourseInfo = false,
  shouldRefreshOnUpdate = false,
  viewMode = "view1",
}: RoleAwareScheduleTableProps) {
  const [selectedSchedule, setSelectedSchedule] =
    useState<ClassSchedule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isFreeTrialDialogOpen, setIsFreeTrialDialogOpen] = useState(false);
  const [feedbackSchedule, setFeedbackSchedule] =
    useState<ClassSchedule | null>(null);
  
  // Attendance confirmation dialog state
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [attendanceSchedule, setAttendanceSchedule] = useState<ClassSchedule | null>(null);
  const [attendanceAction, setAttendanceAction] = useState<"present" | "absent">("present");
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);

  const router = useRouter();
  const [localSchedules, setLocalSchedules] =
    useState<ClassSchedule[]>(schedules);

  // Update local schedules when props change
  useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  // Get student and course info from first schedule (assuming all schedules are for same student/course)
  const firstSchedule = localSchedules[0];

  const handleRowDoubleClick = (schedule: ClassSchedule) => {
    // Prevent editing if schedule is already cancelled
    console.log("handleRowDoubleClick debug:", { schedule });
    if (schedule.schedule_attendance == "cancelled") {
      showToast.error("Cannot edit cancelled schedules. Cancelled schedules are not editable.");
      return;
    }

    if (schedule.course_title?.toLowerCase() === "free trial") {
      setSelectedSchedule(schedule);
      setIsFreeTrialDialogOpen(true);
    }
    else{
    setSelectedSchedule(schedule);
    setIsEditDialogOpen(true);
    }
  };

  const handleViewFeedback = (schedule: ClassSchedule) => {
    setFeedbackSchedule(schedule);
    setIsFeedbackDialogOpen(true);
  };

  const handleScheduleUpdate = (updatedFormData: FormData) => {
    // Update local schedules with the new data
    setLocalSchedules((prevSchedules) =>
      prevSchedules.map((schedule) => {
        if (parseInt(schedule.schedule_id) === updatedFormData.scheduleId) {
          return {
            ...schedule,
            schedule_date: new Date(updatedFormData.date).toISOString(),
            schedule_startTime: updatedFormData.starttime,
            schedule_endTime: updatedFormData.endtime,
            schedule_room: updatedFormData.room,
            schedule_remark: updatedFormData.remark || "",
            schedule_attendance: updatedFormData.status || "pending",
            teacher_name: updatedFormData.teacher,
            course_title: updatedFormData.course,
            student_name: updatedFormData.student,
            student_nickname: updatedFormData.nickname || "",
            schedule_feedback:
              updatedFormData.feedback || schedule.schedule_feedback || "",
            schedule_warning: updatedFormData.warning || "",
          } as ClassSchedule;
        }
        return schedule;
      })
    );

    router.refresh();
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
  };

  const handleQuickAttendanceUpdate = async (
    scheduleId: string, 
    attendanceStatus: "present" | "absent"
  ) => {
    // Find the schedule to check current status
    const schedule = localSchedules.find(s => s.schedule_id === scheduleId);
    if (!schedule) {
      showToast.error("Schedule not found.");
      return;
    }

    const currentAttendance = schedule.schedule_attendance;
    
    // Validation: Cannot change if already completed
    if (currentAttendance === "completed") {
      showToast.error("Cannot change attendance. This session is already marked as completed.");
      return;
    }

    // Validation: Cannot mark as cancelled if already cancelled 
    if (currentAttendance === "cancelled" && attendanceStatus === "absent") {
      showToast.error("This session is already marked as cancelled.");
      return;
    }

    // Show confirmation dialog instead of alert
    setAttendanceSchedule(schedule);
    setAttendanceAction(attendanceStatus);
    setIsAttendanceDialogOpen(true);
  };

  const handleConfirmAttendanceUpdate = async () => {
    if (!attendanceSchedule) return;

    const scheduleId = attendanceSchedule.schedule_id;
    const newAttendance = attendanceAction === "present" ? "completed" : "cancelled";

    setIsUpdatingAttendance(true);

    try {
      await updateSchedule(parseInt(scheduleId), {
        attendance: newAttendance
      });
      
      // Update local state
      setLocalSchedules((prevSchedules) =>
        prevSchedules.map((schedule) => {
          if (schedule.schedule_id === scheduleId) {
            return {
              ...schedule,
              schedule_attendance: newAttendance,
            };
          }
          return schedule;
        })
      );

      showToast.success(`Attendance updated successfully to ${newAttendance}.`);
      
      if (shouldRefreshOnUpdate) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      showToast.error("Failed to update attendance. Please try again.");
    } finally {
      setIsUpdatingAttendance(false);
      setIsAttendanceDialogOpen(false);
      setAttendanceSchedule(null);
    }
  };

  const selectedFormData: FormData | undefined = selectedSchedule
    ? {
        scheduleId: parseInt(selectedSchedule.schedule_id),
        date: new Date(selectedSchedule.schedule_date).toLocaleDateString(
          "en-CA"
        ), // en-CA gives yyyy-MM-dd format without timezone issues
        starttime: selectedSchedule.schedule_startTime,
        endtime: selectedSchedule.schedule_endTime,
        course: selectedSchedule.course_title,
        teacher: selectedSchedule.teacher_name,
        student: selectedSchedule.student_name,
        room: selectedSchedule.schedule_room,
        nickname: selectedSchedule.student_nickname,
        remark: selectedSchedule.schedule_remark,
        feedback: selectedSchedule.schedule_feedback || "",
        feedbackDate: selectedSchedule.schedule_feedbackDate || "",
        status: selectedSchedule.schedule_attendance,
        courseId: parseInt(selectedSchedule.schedule_courseId),
        studentId: parseInt(selectedSchedule.student_id),
        warning: selectedSchedule.schedule_warning || "hello world",
      }
    : undefined;

  return (
    <>
      {localSchedules.length > 0 ? (
        <>
          {/* Student Info Header */}
          {showStudentHeader && (
            <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 border shadow-sm w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="flex items-center justify-center flex-shrink-0">
                  <Image
                    src={firstSchedule.student_profilePicture || "/student.png"}
                    alt="Student Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-gray-200"
                  />
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                    {firstSchedule.student_name}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 break-words">
                    {firstSchedule.course_title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Table */}
          <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border mb-10 relative" style={{ maxWidth: '100vw' }}>
            <div className="overflow-x-auto">
              <Table className="min-w-max w-full">
            <TableHeader>
              <TableRow className="">
                <TableHead className="border h-30 text-center whitespace-nowrap min-w-[50px]">
                  No.
                </TableHead>
                {!showStudentHeader && (
                  <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[80px]">
                    Profile
                  </TableHead>
                )}
                {!showStudentHeader && (
                  <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                    Student
                  </TableHead>
                )}
                {
                  viewMode === "view2" && (
                    <>
                      <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                      Contact Number
                      </TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                        Nickname
                      </TableHead>
                    </>
                  )
                }
                {!showStudentHeader && !hideCourseInfo && (
                  <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                    Course
                  </TableHead>
                )}
                {!hideCourseInfo && (
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[100px]">
                    Date
                  </TableHead>
                )}
                {!hideCourseInfo && (
                  <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                    Time
                  </TableHead>
                )}

                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                  Teacher
                </TableHead>

                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[80px]">
                  Room
                </TableHead>

                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                  Attendance
                </TableHead>

                {viewMode === "view1" ? (
                  <>
                    <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                      Remark
                    </TableHead>
                    {/* Show Feedback column for teachers */}
                    {userRole === UserRole.TEACHER && (
                      <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[100px]">
                        Feedback
                      </TableHead>
                    )}
                    {/* Show Feedback column for student session detail pages */}
                    <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                      Feedback
                    </TableHead>
                  </>
                ) : (
                  <>
                      <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[150px]">
                        Actions
                      </TableHead>
                  </>
                )}
                
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[150px]">
                  Warning
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localSchedules.map((session: ClassSchedule, index) => (
                <TableRow
                  key={session.schedule_id}
                  onDoubleClick={() => handleRowDoubleClick(session)}
                  className={`transition-colors ${
                    session.schedule_attendance === "cancelled"
                      ? "bg-gray-100 opacity-75 cursor-not-allowed hover:bg-gray-100"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  title={
                    session.schedule_attendance === "cancelled"
                      ? "Cancelled schedules cannot be edited"
                      : userRole === UserRole.TEACHER
                      ? "Double-click to update attendance and feedback"
                      : "Double-click to edit"
                  }
                >
                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[50px]">
                    {index + 1}
                  </TableCell>
                  {!showStudentHeader && (
                    <TableCell className="border h-30 text-center px-2 min-w-[80px]">
                      <div className="flex items-center justify-center">
                        <Image
                          src={session.student_profilePicture || "/student.png"}
                          alt="Student Profile"
                          width={40}
                          height={40}
                          className="rounded-full border border-gray-200"
                        />
                      </div>
                    </TableCell>
                  )}
                  {!showStudentHeader && (
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[120px]">
                      {session.student_name}
                    </TableCell>
                  )}
                  {viewMode === "view2" && (
                    <>
                      <TableCell className="border h-30 text-center px-2 min-w-[120px]">
                        {session.student_phone || "N/A"}
                      </TableCell>
                      <TableCell className="border h-30 text-center px-2 min-w-[100px]">
                        {session.student_nickname || "N/A"}
                      </TableCell>
                    </>
                  )}
                  {!showStudentHeader && !hideCourseInfo && (
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[120px]">
                      {session.course_title}
                    </TableCell>
                  )}
                  {!hideCourseInfo && (
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                      {session.schedule_date
                        ? new Date(session.schedule_date).toLocaleDateString(
                            "en-GB"
                          )
                        : "TBD"}
                    </TableCell>
                  )}
                  {!hideCourseInfo && (
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[120px]">
                      {`${session.schedule_startTime} - ${session.schedule_endTime}`}
                    </TableCell>
                  )}

                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                    {session.teacher_name || "TBD"}
                  </TableCell>

                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[80px]">
                    {session.schedule_room}
                  </TableCell>

                  <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                    {getAttendanceBadge(session.schedule_attendance)}
                  </TableCell>

                  {viewMode === "view1" ? (
                    <>
                      <TableCell className="border h-30 text-center px-2 min-w-[120px] max-w-[200px]">
                        <div className="truncate" title={session.schedule_remark || ""}>
                          {session.schedule_remark || ""}
                        </div>
                      </TableCell>
                      {/* Show Feedback column for teachers */}
                      {userRole === UserRole.TEACHER && (
                        <TableCell className="border h-30 text-center whitespace-nowrap px-2 min-w-[100px]">
                          {session.schedule_feedback ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-700 border-green-300"
                            >
                              Completed
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-600"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      {/* Show Feedback column for student session detail pages */}
                      <TableCell className="border h-30 text-center px-2 min-w-[120px]">
                        {session.schedule_feedback ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFeedback(session);
                            }}
                            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium whitespace-nowrap"
                          >
                            View Feedback
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm whitespace-nowrap">No feedback</span>
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="border h-30 text-center px-2 min-w-[150px]">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAttendanceUpdate(session.schedule_id, "present");
                            }}
                            className={`h-8 w-8 p-0 ${
                              session.schedule_attendance === "completed"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                            title={
                              session.schedule_attendance === "completed"
                                ? "Already completed"
                                : "Mark Present (Completed)"
                            }
                            disabled={session.schedule_attendance === "completed"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAttendanceUpdate(session.schedule_id, "absent");
                            }}
                            className={`h-8 w-8 p-0 ${
                              session.schedule_attendance === "completed" || session.schedule_attendance === "cancelled"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }`}
                            title={
                              session.schedule_attendance === "completed"
                                ? "Cannot cancel completed session"
                                : session.schedule_attendance === "cancelled"
                                ? "Already cancelled"
                                : "Mark Absent (Cancelled)"
                            }
                            disabled={session.schedule_attendance === "completed" || session.schedule_attendance === "cancelled"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowDoubleClick(session);
                            }}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit Schedule"
                            disabled={session.schedule_attendance === "cancelled"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                  
                  <TableCell className="border h-30 text-center text-red-500 px-2 min-w-[150px] max-w-[250px]">
                    <div className="break-words whitespace-normal" title={session.schedule_warning || ""}>
                      {session.schedule_warning}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </div>
          </div>

          {/* Role-based Edit Dialog */}
          {userRole === UserRole.TEACHER ? (
            <TeacherEditScheduleDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              initialData={selectedFormData}
              onScheduleUpdate={handleScheduleUpdate}
            />
          ) : (
            <EditSchedule
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              initialData={selectedFormData}
              onScheduleUpdate={handleScheduleUpdate}
            />
          )}

          {/* Free Trial Edit Dialog */}
          <FreeTrialEditDialog
            open={isFreeTrialDialogOpen}
            onOpenChange={setIsFreeTrialDialogOpen}
            initialData={selectedFormData}
            onScheduleUpdate={handleScheduleUpdate}
          />

          {/* Feedback View Dialog */}
          <Dialog
            open={isFeedbackDialogOpen}
            onOpenChange={setIsFeedbackDialogOpen}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Session Feedback
                </DialogTitle>
              </DialogHeader>

              {feedbackSchedule && (
                <div className="space-y-4">
                  {/* Session Information */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          feedbackSchedule.student_profilePicture ||
                          "/student.png"
                        }
                        alt={feedbackSchedule.student_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {feedbackSchedule.student_name}
                          {feedbackSchedule.student_nickname && (
                            <span className="text-gray-500 font-normal ml-1">
                              ({feedbackSchedule.student_nickname})
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">
                          {feedbackSchedule.course_title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {feedbackSchedule.schedule_date
                            ? new Date(
                                feedbackSchedule.schedule_date
                              ).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4" />
                        <span>{feedbackSchedule.teacher_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Time:</span>
                        <span>
                          {feedbackSchedule.schedule_startTime} -{" "}
                          {feedbackSchedule.schedule_endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="bg-white rounded-md p-4 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Teacher&apos;s Feedback
                    </div>
                    <div className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {feedbackSchedule.schedule_feedback ||
                        "No feedback available"}
                    </div>
                  </div>

                  {feedbackSchedule.schedule_feedbackDate && (
                    <div className="text-xs text-gray-500 text-center">
                      Feedback provided on{" "}
                      {new Date(
                        feedbackSchedule.schedule_feedbackDate
                      ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
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

      {/* Attendance Confirmation Dialog */}
      <AttendanceConfirmationDialog
        isOpen={isAttendanceDialogOpen}
        onClose={() => setIsAttendanceDialogOpen(false)}
        onConfirm={handleConfirmAttendanceUpdate}
        schedule={attendanceSchedule}
        action={attendanceAction}
        isLoading={isUpdatingAttendance}
      />
    </>
  );
}
