import ScheduleClientSide from "@/components/schedule/schedule-client-side";
import ScheduleFilter from "@/components/schedule/schedule-filter";
import { getAllSchedules, getFilteredSchedules } from "@/lib/axio";
import Image from "next/image";

export default async function ClassSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    studentName?: string;
  }>;
}) {
  const { startDate, endDate, studentName } = await searchParams;

  let schedules;
  if (startDate || endDate || studentName) {
    // Only fetch if all are present, else fallback to all
    if (startDate && endDate && studentName) {
      schedules = await getFilteredSchedules({
        startDate,
        endDate,
        studentName,
      });
    } else {
      schedules = await getAllSchedules();
    }
  } else {
    schedules = await getAllSchedules();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Schedules</div>
          <ScheduleFilter />
        </div>
      </div>

      <div className=" rounded-lg ">
        {schedules.length > 0 ? (
          <ScheduleClientSide initialSchedules={schedules} />
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
              No schedules for today!
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
