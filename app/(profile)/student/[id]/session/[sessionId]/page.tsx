import { getSchedulesByStudentAndSession } from "@/lib/api";
import Link from "next/link";
import React from "react";
import { CompleteSessionDialog } from "@/components/entities/students/dialogs/complete-session-dialog";
import { CancelSessionDialog } from "@/components/entities/students/dialogs/cancel-session-dialog";
import { cookies } from "next/headers";
import RoleAwareScheduleTable from "@/components/entities/schedule/tables/role-aware-schedule-table";
import { UserRole } from "@/app/types/auth.type";

export default async function StudentSession({
  params,
}: {
  params: Promise<{ id: number; sessionId: number }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const { sessionId, id } = await params;
  const schedules = await getSchedulesByStudentAndSession(
    sessionId,
    Number(id),
    accessToken
  );

  return (
    <div className="p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <nav className="flex flex-col sm:flex-row sm:items-center font-medium">
          <div className="flex items-center flex-wrap gap-1 sm:gap-2">
            <Link
              href="/students"
              className="text-gray-900 hover:underline text-xl sm:text-2xl lg:text-3xl font-bold cursor-pointer"
            >
              Students
            </Link>
            <span className="mx-1 text-xl sm:text-2xl lg:text-3xl">&gt;</span>
            <Link
              href={`/student/${id}`}
              className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-bold hover:underline cursor-pointer break-words"
            >
              {schedules[0].student_name}
            </Link>
            <span className="mx-1 text-xl sm:text-2xl lg:text-3xl">&gt;</span>
            <span className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-bold break-words">
              {schedules[0].course_title}
            </span>
          </div>
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0 justify-end">
          <CancelSessionDialog
            sessionId={sessionId}
            sessionTitle={schedules[0].course_title}
          />
          <CompleteSessionDialog
            sessionId={sessionId}
            sessionTitle={schedules[0].course_title}
          />
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <RoleAwareScheduleTable schedules={schedules} userRole={UserRole.ADMIN} />
      </div>
    </div>
  );
}
