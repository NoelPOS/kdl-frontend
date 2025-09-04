import { Suspense } from "react";
import ScheduleClientSide from "@/components/entities/schedule/lists/schedule-client-side";
import { ScheduleFilterForm } from "@/components/entities/schedule/filters/schedule-filter";
import PageHeader from "@/components/shared/page-header";
import { getFilteredSchedules, ScheduleFilter } from "@/lib/api";
import { cookies } from "next/headers";

async function ScheduleData({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const currentPage = parseInt((searchParams.page as string) || "1", 10);
  const filter: ScheduleFilter = {
    startDate: (searchParams.startDate as string) || undefined,
    endDate: (searchParams.endDate as string) || undefined,
    studentName: (searchParams.studentName as string) || undefined,
    teacherName: (searchParams.teacherName as string) || undefined,
    courseName: (searchParams.courseName as string) || undefined,
    attendanceStatus: (searchParams.attendanceStatus as string) || undefined,
    classStatus: (searchParams.classStatus as string) || undefined,
    room: (searchParams.room as string) || undefined,
    sessionMode: (searchParams.sessionMode as string) || undefined,
    sort: (searchParams.sort as string) || undefined,
    classOption: (searchParams.classOption as string) || undefined,
  };

  const data = await getFilteredSchedules(filter, currentPage, 10, accessToken);
  console.log("Fetched schedule data:", data);

  return (
    <ScheduleClientSide
      initialSchedules={data.schedules}
      initialPagination={data.pagination}
    />
  );
}

export default async function ClassSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  const hasFilters = Object.values(resolvedSearchParams).some(
    (v) => v !== undefined && v !== ""
  );
  
  if (hasFilters) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      
      const filter: ScheduleFilter = {
        startDate: (resolvedSearchParams.startDate as string) || undefined,
        endDate: (resolvedSearchParams.endDate as string) || undefined,
        studentName: (resolvedSearchParams.studentName as string) || undefined,
        teacherName: (resolvedSearchParams.teacherName as string) || undefined,
        courseName: (resolvedSearchParams.courseName as string) || undefined,
        attendanceStatus: (resolvedSearchParams.attendanceStatus as string) || undefined,
        classStatus: (resolvedSearchParams.classStatus as string) || undefined,
        room: (resolvedSearchParams.room as string) || undefined,
        sessionMode: (resolvedSearchParams.sessionMode as string) || undefined,
        sort: (resolvedSearchParams.sort as string) || undefined,
        classOption: (resolvedSearchParams.classOption as string) || undefined,
      };

      const { lastUpdated: timestamp } = await getFilteredSchedules(
        filter,
        1, // Just get first page for timestamp
        1, // Minimal limit
        accessToken
      );
      lastUpdated = timestamp;
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Schedules" lastUpdated={lastUpdated} />
      
      <Suspense fallback={<div>Loading filters...</div>}>
        <ScheduleFilterForm />
      </Suspense>

      <div className="rounded-lg ">
        {!hasFilters ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for schedules.
          </div>
        ) : (
          <Suspense
            key={JSON.stringify(resolvedSearchParams)}
            fallback={<div>Loading...</div>}
          >
            <ScheduleData searchParams={resolvedSearchParams} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
