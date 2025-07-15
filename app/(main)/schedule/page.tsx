import { Suspense } from "react";
import ScheduleClientSide from "@/components/schedule/schedule-client-side";
import { ScheduleFilterForm } from "@/components/schedule/schedule-filter";

export default function ClassSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
        <Suspense fallback={<div>Loading schedule...</div>}>
          <ScheduleClientSide />
        </Suspense>
      </div>
    </div>
  );
}
