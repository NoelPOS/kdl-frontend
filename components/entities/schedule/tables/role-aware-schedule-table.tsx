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
import { MessageSquare, User, BookOpen, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { set } from "nprogress";

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

interface RoleAwareScheduleTableProps {
  schedules: ClassSchedule[];
  userRole: UserRole;
  showStudentHeader?: boolean; // true for student detail page, false for general schedule page
  onScheduleUpdate?: (schedule: FormData) => void;
  hideCourseInfo?: boolean; // true for today page, false for other pages
  shouldRefreshOnUpdate?: boolean;
}

export default function RoleAwareScheduleTable({
  schedules,
  userRole,
  showStudentHeader = true,
  onScheduleUpdate,
  hideCourseInfo = false,
  shouldRefreshOnUpdate = false,
}: RoleAwareScheduleTableProps) {
  const [selectedSchedule, setSelectedSchedule] =
    useState<ClassSchedule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isFreeTrialDialogOpen, setIsFreeTrialDialogOpen] = useState(false);
  const [feedbackSchedule, setFeedbackSchedule] =
    useState<ClassSchedule | null>(null);

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
    // Convert ClassSchedule to FormData format
    // const formData: FormData = {
    //   scheduleId: parseInt(schedule.schedule_id),
    //   date: schedule.schedule_date,
    //   starttime: schedule.schedule_startTime,
    //   endtime: schedule.schedule_endTime,
    //   course: schedule.course_title,
    //   teacher: schedule.teacher_name,
    //   student: schedule.student_name,
    //   room: schedule.schedule_room,
    //   nickname: schedule.student_nickname,
    //   remark: schedule.schedule_remark,
    //   feedback: schedule.schedule_feedback || "",
    //   feedbackDate: schedule.schedule_feedbackDate || "",
    //   status: schedule.schedule_attendance,
    //   courseId: parseInt(schedule.schedule_courseId),
    //   studentId: parseInt(schedule.student_id),
    //   warning: schedule.schedule_warning,
    // };

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
                {/* {showStudentHeader && ( */}
                <TableHead className="border h-30 text-center whitespace-nowrap font-semibold min-w-[120px]">
                  Feedback
                </TableHead>
                {/* )} */}
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
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  title={
                    userRole === UserRole.TEACHER
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
                  {/* {showStudentHeader && ( */}
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
                  {/* )} */}
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
    </>
  );
}
