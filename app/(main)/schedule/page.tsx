import { Suspense } from "react";
import ScheduleClientSide from "@/components/entities/schedule/lists/schedule-client-side";
import { ScheduleFilterForm } from "@/components/entities/schedule/filters/schedule-filter";
import { getFilteredSchedules, ScheduleFilter } from "@/lib/axio";

async function ScheduleData({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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

  const data = await getFilteredSchedules(filter, currentPage, 10);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Schedules</div>
        </div>
      </div>
      <Suspense fallback={<div>Loading filters...</div>}>
        <ScheduleFilterForm />
      </Suspense>

      <div className="rounded-lg ">
        {Object.values(resolvedSearchParams).every(
          (v) => v === undefined || v === ""
        ) ? (
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
