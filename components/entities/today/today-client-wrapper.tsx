"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RenderSchedule from "./render-schedule";
import { Course, ScheduleData } from "@/app/types/today.type";
import Image from "next/image";

interface TodayClientWrapperProps {
  initialScheduleData: ScheduleData;
  formattedDate: string;
  hasCourses: boolean;
}

export default function TodayClientWrapper({
  initialScheduleData,
  formattedDate,
  hasCourses,
}: TodayClientWrapperProps) {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState(initialScheduleData);
  const [coursesExist, setCoursesExist] = useState(hasCourses);

  useEffect(() => {
    const handleScheduleUpdate = () => {
      console.log("Schedule updated, refreshing page...");
      router.refresh(); // This will cause the server component to re-fetch data
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data
        router.refresh();
      }
    };

    // Listen for custom schedule update events
    window.addEventListener("scheduleUpdated", handleScheduleUpdate);

    // Listen for page visibility changes (when user navigates back)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scheduleUpdated", handleScheduleUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  // Update local state when props change (from server refresh)
  useEffect(() => {
    setScheduleData(initialScheduleData);
    setCoursesExist(hasCourses);
  }, [initialScheduleData, hasCourses]);

  return (
    <div className="p-6 bg-white h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{formattedDate}</h1>
        {coursesExist ? (
          <RenderSchedule scheduleData={scheduleData} />
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
