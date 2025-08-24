import React from "react";
import { Course } from "@/app/types/today.type";
import { ClassSchedule } from "@/app/types/schedule.type";

interface ScheduleRowProps {
  course: {
    startIndex: number;
    endIndex: number;
    span: number;
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    color: string;
    teacher: string;
    room: string;
    fullTime: string;
    students: ClassSchedule[];
  };
  numCols: number;
  selectedCourse: Course | null;
  handleCourseClick: (course: Course) => void;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  course,
  numCols,
  selectedCourse,
  handleCourseClick,
}) => (
  <div
    className="grid gap-0 min-h-[50px] sm:min-h-[60px]"
    style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
  >
    {/* Empty cells before course starts */}
    {Array.from({ length: course.startIndex }).map((_, index) => (
      <div key={`empty-start-${course.id}-${index}`}></div>
    ))}

    {/* Course block */}
    <div
      className={`
        ${
          course.color
        } text-white rounded p-1 sm:p-3 flex items-center justify-center 
        font-medium cursor-pointer hover:opacity-90 transition-opacity border border-gray-300
        ${selectedCourse?.id === course.id ? "ring-2 ring-gray-800" : ""}
      `}
      style={{ gridColumn: `span ${course.span}` }}
      onClick={() => handleCourseClick(course)}
    >
      <div className="text-center">
        <div className="text-xs sm:text-sm font-semibold leading-tight">
          <span className="block sm:hidden">
            {course.title.split(" (")[0]}{" "}
          </span>
          <span className="hidden sm:block">{course.title}</span>
        </div>
        <div className="hidden md:block text-xs opacity-90 mt-1">
          Room: {course.room}
        </div>
      </div>
    </div>

    {/* Empty cells after course ends */}
    {Array.from({ length: numCols - course.endIndex }).map((_, index) => (
      <div key={`empty-end-${course.id}-${index}`}></div>
    ))}
  </div>
);

export default ScheduleRow;
