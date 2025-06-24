import StudentSchedule from "@/components/students/student-schedule";
import { getSchedulesByStudentAndSession } from "@/lib/axio";
import Link from "next/link";
import React from "react";

export default async function StudentSession({
  params,
}: {
  params: Promise<{ id: number; sessionId: number }>;
}) {
  const { sessionId, id } = await params;
  const schedules = await getSchedulesByStudentAndSession(
    sessionId,
    Number(id)
  );

  return (
    <div className="p-6">
      <nav className="flex items-center font-medium mb-4">
        <Link
          href="/students"
          className="text-gray-900 hover:underline text-3xl font-bold cursor-pointer"
        >
          Students
        </Link>
        <span className="mx-1 text-3xl">&gt;</span>
        <Link
          href={`/student/${id}`}
          className="text-gray-900 text-3xl font-bold hover:underline cursor-pointer"
        >
          {schedules[0].student_name}
        </Link>
        <span className="mx-1 text-3xl">&gt;</span>
        <span className="text-gray-900 text-3xl font-bold">
          {schedules[0].course_title}
        </span>
      </nav>
      <StudentSchedule initialSchedules={schedules} />
    </div>
  );
}
