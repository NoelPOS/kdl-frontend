"use client";

import { useMemo, useCallback, useState } from "react";

import TimeHeaders from "./time-headers";
import ScheduleRow from "./schedule-row";
import CourseDetails from "./course-details";
import { Course, ScheduleData } from "@/app/types/today.type";
import { timeSlots } from "@/lib/data";

function generateTimeSlots(courses: Course[]): string[] {
  return timeSlots;
}

// Check if two courses overlap in time
function coursesOverlap(course1: any, course2: any): boolean {
  return (
    course1.startIndex < course2.endIndex &&
    course1.endIndex > course2.startIndex
  );
}

// Group courses into rows where non-overlapping courses share the same row
function groupCoursesIntoRows(courses: any[]): any[][] {
  const rows: any[][] = [];

  // Sort courses by start time for better grouping
  const sortedCourses = [...courses].sort(
    (a, b) => a.startIndex - b.startIndex
  );

  for (const course of sortedCourses) {
    let placed = false;

    // Try to place the course in an existing row
    for (const row of rows) {
      const overlaps = row.some((existingCourse) =>
        coursesOverlap(course, existingCourse)
      );

      if (!overlaps) {
        row.push(course);
        placed = true;
        break;
      }
    }

    // If no suitable row found, create a new row
    if (!placed) {
      rows.push([course]);
    }
  }

  return rows;
}

interface RenderScheduleProps {
  scheduleData: ScheduleData;
}

const RenderSchedule: React.FC<RenderScheduleProps> = ({ scheduleData }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourseId(course.id);
  }, []);

  const selectedCourse = useMemo(() => {
    return scheduleData.courses.find((c) => c.id === selectedCourseId) || null;
  }, [selectedCourseId, scheduleData.courses]);

  // Generate dynamic time slots based on actual schedule data
  const dynamicTimeSlots = useMemo(() => {
    const slots = generateTimeSlots(scheduleData.courses);
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

  const coursesWithIndices = useMemo(() => {
    return scheduleData.courses.map((course) => {
      const startIndex = dynamicTimeSlots.indexOf(course.startTime);
      const endIndex = dynamicTimeSlots.indexOf(course.endTime);
      const span = endIndex - startIndex;
      return {
        ...course,
        startIndex,
        endIndex,
        span,
      };
    });
  }, [scheduleData.courses, dynamicTimeSlots]);

  const courseRows = useMemo(() => {
    return groupCoursesIntoRows(coursesWithIndices);
  }, [coursesWithIndices]);

  return (
    <>
      <div className="bg-gray-50 rounded-lg border p-2 sm:p-4 mb-6 overflow-x-auto">
        {/* Time Headers  */}
        <TimeHeaders numCols={numCols} timeHeaders={timeHeaders} />

        {/* Schedule Rows */}
        <div className="space-y-1 sm:space-y-2">
          {courseRows.map((row, rowIndex) => (
            <ScheduleRow
              key={`row-${rowIndex}`}
              courses={row}
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
