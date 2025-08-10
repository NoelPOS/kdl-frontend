"use client";

import { useMemo, useCallback, useState } from "react";

import TimeHeaders from "./time-headers";
import ScheduleRow from "./schedule-row";
import CourseDetails from "./course-details";
import { Course, ScheduleData } from "@/app/types/today.type";
import { timeSlots } from "@/lib/data";

// Helper function to generate dynamic time slots based on schedule data
function generateTimeSlots(courses: Course[]): string[] {
  if (courses.length === 0) {
    return timeSlots; // fallback to default
  }

  // Get all start and end times
  const allTimes = courses.flatMap((course) => [
    course.startTime,
    course.endTime,
  ]);

  // Convert to minutes for easier calculation
  const timeInMinutes = allTimes.map((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  });

  // Find min and max, round to 30-minute boundaries
  const minTime = Math.floor(Math.min(...timeInMinutes) / 30) * 30;
  const maxTime = Math.ceil(Math.max(...timeInMinutes) / 30) * 30;

  // Generate slots
  const slots = [];
  for (let time = minTime; time <= maxTime; time += 30) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    slots.push(
      `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    );
  }

  return slots;
}

interface RenderScheduleProps {
  scheduleData: ScheduleData;
}

const RenderSchedule: React.FC<RenderScheduleProps> = ({ scheduleData }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  // Generate dynamic time slots based on actual schedule data
  const dynamicTimeSlots = useMemo(() => {
    console.log(
      "Generating dynamic time slots for courses:",
      scheduleData.courses
    );
    const slots = generateTimeSlots(scheduleData.courses);
    console.log("Generated slots:", slots);
    return slots;
  }, [scheduleData.courses]);

  const numCols = useMemo(
    () => dynamicTimeSlots.length - 1,
    [dynamicTimeSlots]
  );

  const timeHeaders = useMemo(() => {
    return Array.from({ length: numCols }).map((_, index) => ({
      key: index,
      startTime: dynamicTimeSlots[index].endsWith(":30")
        ? ""
        : dynamicTimeSlots[index],
      endTime: index === numCols - 1 ? dynamicTimeSlots[index + 1] : "",
    }));
  }, [numCols, dynamicTimeSlots]);

  const courseRows = useMemo(() => {
    return scheduleData.courses.map((course) => {
      const startIndex = dynamicTimeSlots.indexOf(course.startTime);
      const endIndex = dynamicTimeSlots.indexOf(course.endTime);
      const span = endIndex - startIndex;

      // console.log("Start, end", startIndex, endIndex);
      // console.log("span", span);

      return {
        ...course,
        startIndex,
        endIndex,
        span,
      };
    });
  }, [scheduleData.courses, dynamicTimeSlots]);

  return (
    <>
      <div className="bg-gray-50 rounded-lg border p-2 sm:p-4 mb-6 overflow-x-auto">
        {/* Time Headers  */}
        <TimeHeaders numCols={numCols} timeHeaders={timeHeaders} />

        {/* Schedule Rows */}
        <div className="space-y-1 sm:space-y-2">
          {courseRows.map((course) => (
            <ScheduleRow
              key={course.id}
              course={course}
              numCols={numCols}
              selectedCourse={selectedCourse}
              handleCourseClick={handleCourseClick}
            />
          ))}
        </div>
      </div>
      <CourseDetails selectedCourse={selectedCourse} />
    </>
  );
};

export default RenderSchedule;
