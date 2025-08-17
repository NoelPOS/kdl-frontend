import { getSchedulesBySession } from "@/lib/api";
import Link from "next/link";
import React from "react";
import TeacherSessionSchedule from "@/components/entities/sessions/details/teacher-session-schedule";
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
      </div>

      <TeacherSessionSchedule initialSchedules={schedules} />
    </div>
  );
}
