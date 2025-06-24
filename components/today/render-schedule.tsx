"use client";

import { useMemo, useCallback, useState } from "react";

import TimeHeaders from "./time-headers";
import ScheduleRow from "./schedule-row";
import CourseDetails from "./course-details";
import { Course, ScheduleData } from "@/app/types/today.type";
import { timeSlots } from "@/lib/data";

interface RenderScheduleProps {
  scheduleData: ScheduleData;
}

const RenderSchedule: React.FC<RenderScheduleProps> = ({ scheduleData }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  // Memoize the number of columns calculation
  const numCols = useMemo(() => timeSlots.length - 1, []);

  // Memoize the time headers
  const timeHeaders = useMemo(() => {
    return Array.from({ length: numCols }).map((_, index) => ({
      key: index,
      startTime: timeSlots[index].endsWith(":30") ? "" : timeSlots[index],
      endTime: index === numCols - 1 ? timeSlots[index + 1] : "",
    }));
  }, [numCols]);

  // Memoize the course rows
  const courseRows = useMemo(() => {
    return scheduleData.courses.map((course) => {
      const startIndex = timeSlots.indexOf(course.startTime);
      const endIndex = timeSlots.indexOf(course.endTime);
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
  }, [scheduleData.courses]);

  return (
    <>
      <div className="bg-gray-50 rounded-lg border p-4 mb-6">
        {/* Time Headers  */}
        <TimeHeaders numCols={numCols} timeHeaders={timeHeaders} />

        {/* Schedule Rows */}
        <div className="space-y-2">
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
