import { getSchedulesBySession } from "@/lib/api";
import Link from "next/link";
import React from "react";
import TeacherFeedbackDialog from "@/components/entities/sessions/dialogs/teacher-feedback-dialog";
import { TeacherSessionSchedule } from "@/components/entities/sessions";
import { cookies } from "next/headers";

export default async function TeacherSessionDetails({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;

  // Get all schedules for this session (all students)
  const schedules = await getSchedulesBySession(Number(sessionId), accessToken);

  // Mock session data for feedback dialog
  const sessionData = {
    sessionId: Number(sessionId),
    courseTitle: schedules[0]?.course_title || "Course",
    mode: "8 Classes",
    completedCount: 0,
    classCancel: 0,
    progress: "0%",
    payment: "paid",
    status: "wip",
    medium: "Online",
    courseDescription: "Course description",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <nav className="flex items-center font-medium">
          <Link
            href="/session"
            className="text-gray-900 hover:underline text-3xl font-bold cursor-pointer"
          >
            My Sessions
          </Link>
          <span className="mx-1 text-3xl">&gt;</span>
          <span className="text-gray-900 text-3xl font-bold">
            {schedules[0]?.course_title || "Session Details"}
          </span>
        </nav>

        <div className="flex gap-2">
          <TeacherFeedbackDialog session={sessionData} />
        </div>
      </div>

      <TeacherSessionSchedule initialSchedules={schedules} />
    </div>
  );
}
