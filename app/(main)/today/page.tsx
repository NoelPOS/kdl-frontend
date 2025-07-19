export const dynamic = "force-dynamic";

import { Course } from "@/app/types/today.type";
import RenderSchedule from "@/components/today/render-schedule";
import { getTodaySchedules } from "@/lib/axio";
import Image from "next/image";

export default async function TodayPage() {
  const raw = await getTodaySchedules();
  const grouped = raw.reduce((acc: Record<string, Course>, item) => {
    const key = `${item.course_title} (${item.teacher_name})-${item.schedule_room}`;

    if (!acc[key]) {
      acc[key] = {
        id: Number(item.schedule_id),
        title: `${item.course_title} (${item.teacher_name})`,
        startTime: item.schedule_startTime,
        endTime: item.schedule_endTime,
        fullTime: `${item.schedule_startTime} - ${item.schedule_endTime}`,
        teacher: item.teacher_name,
        room: item.schedule_room,
        color: "bg-blue-400",
        students: [],
      };
    }
    // console.log("item", item);

    acc[key].students.push(item);

    return acc;
  }, {});

  const formattedDate = new Date().toLocaleDateString("en-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const hasCourses = Object.values(grouped).length > 0;

  return (
    <div className="p-6 bg-white h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{formattedDate}</h1>
        {hasCourses ? (
          <RenderSchedule
            scheduleData={{
              date: formattedDate,
              courses: Object.values(grouped),
            }}
          />
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
