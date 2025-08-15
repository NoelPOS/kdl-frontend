import StudentSchedule from "@/components/entities/students/details/student-schedule";
import { getSchedulesByStudentAndSession } from "@/lib/axio";
import Link from "next/link";
import React from "react";
import { CompleteSessionDialog } from "@/components/entities/students/dialogs/complete-session-dialog";

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
      <div className="flex items-center justify-between mb-4">
        <nav className="flex items-center font-medium">
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

        <CompleteSessionDialog
          sessionId={sessionId}
          sessionTitle={schedules[0].course_title}
        />
      </div>

      <StudentSchedule initialSchedules={schedules} />
    </div>
  );
}
