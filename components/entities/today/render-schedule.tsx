"use client";

import { useMemo, useCallback, useState } from "react";

import TimeHeaders from "./time-headers";
import ScheduleRow from "./schedule-row";
import CourseDetails from "./course-details";
import { Course, ScheduleData } from "@/app/types/today.type";
import { timeSlots } from "@/lib/data";

// Helper function to always return fixed time slots from 9 AM to 5 PM
function generateTimeSlots(courses: Course[]): string[] {
  // Always return the default time slots (9 AM to 5 PM) regardless of actual schedule times
  return timeSlots;
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
