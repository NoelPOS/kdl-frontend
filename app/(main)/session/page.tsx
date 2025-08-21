import { Suspense } from "react";
import ScheduleClientSide from "@/components/entities/schedule/lists/schedule-client-side";
import { ScheduleFilterForm } from "@/components/entities/schedule/filters/schedule-filter";
import { getFilteredSchedules, ScheduleFilter } from "@/lib/api";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/jwt";

async function SessionScheduleData({
  searchParams,
  teacherName,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  teacherName: string;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const currentPage = parseInt((searchParams.page as string) || "1", 10);
  const filter: ScheduleFilter = {
    startDate: (searchParams.startDate as string) || undefined,
    endDate: (searchParams.endDate as string) || undefined,
    studentName: (searchParams.studentName as string) || undefined,
    teacherName: teacherName, // Always filter by current teacher
    courseName: (searchParams.courseName as string) || undefined,
    attendanceStatus: (searchParams.attendanceStatus as string) || undefined,
    classStatus: (searchParams.classStatus as string) || undefined,
    room: (searchParams.room as string) || undefined,
    sessionMode: (searchParams.sessionMode as string) || undefined,
    sort: (searchParams.sort as string) || undefined,
    classOption: (searchParams.classOption as string) || undefined,
  };

  const data = await getFilteredSchedules(filter, currentPage, 10, accessToken);
  console.log("Fetched teacher session schedule data:", data);

  return (
    <ScheduleClientSide
      initialSchedules={data.schedules}
      initialPagination={data.pagination}
    />
  );
}

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Get current user info from token to get teacher name
  const user = accessToken ? getUserFromToken(accessToken) : null;
  const teacherName = user ? user.name : "";

  if (!teacherName) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 py-8">
          Unable to load sessions. Please login again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">My Sessions</div>
        </div>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <ScheduleFilterForm
          hideTeacherField={true}
          defaultTeacherName={teacherName}
        />
      </Suspense>

      <div className="rounded-lg">
        {Object.values(resolvedSearchParams).every(
          (v) => v === undefined || v === ""
        ) ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for sessions.
          </div>
        ) : (
          <Suspense
            key={JSON.stringify(resolvedSearchParams)}
            fallback={<div>Loading...</div>}
          >
            <SessionScheduleData
              searchParams={resolvedSearchParams}
              teacherName={teacherName}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
