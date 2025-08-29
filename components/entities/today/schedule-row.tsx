import React from "react";
import { Course } from "@/app/types/today.type";
import { ClassSchedule } from "@/app/types/schedule.type";

interface ScheduleRowProps {
  courses: {
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
  }[];
  numCols: number;
  selectedCourse: Course | null;
  handleCourseClick: (course: Course) => void;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  courses,
  numCols,
  selectedCourse,
  handleCourseClick,
}) => {
  const renderCell = (colIndex: number) => {
    // Find the course that starts at this exact column
    const courseStartingHere = courses.find((c) => c.startIndex === colIndex);

    if (courseStartingHere) {
      // Render the course block
      return (
        <div
          key={`course-${courseStartingHere.id}`}
          className={`
            ${
              courseStartingHere.color
            } text-white rounded p-1 sm:p-3 flex items-center justify-center 
            font-medium cursor-pointer hover:opacity-90 transition-opacity border border-gray-300
            ${
              selectedCourse?.id === courseStartingHere.id
                ? "ring-2 ring-gray-800"
                : ""
            }
          `}
          style={{ gridColumn: `span ${courseStartingHere.span}` }}
          onClick={() => handleCourseClick(courseStartingHere)}
        >
          <div className="text-center">
            <div className="text-xs sm:text-sm font-semibold leading-tight">
              <span className="block sm:hidden">
                {courseStartingHere.title.split(" (")[0]}{" "}
              </span>
              <span className="hidden sm:block">
                {courseStartingHere.title}
              </span>
            </div>
            <div className="hidden md:block text-xs opacity-90 mt-1">
              Room: {courseStartingHere.room}
            </div>
          </div>
        </div>
      );
    }

    // Check if this column is occupied by a continuing course
    const occupyingCourse = courses.find(
      (c) => c.startIndex < colIndex && c.endIndex > colIndex
    );

    if (!occupyingCourse) {
      // Empty cell - only render if not occupied by a spanning course
      return <div key={`empty-${colIndex}`}></div>;
    }

    // This cell is occupied by a spanning course, don't render anything
    return null;
  };

  return (
    <div
      className="grid gap-0 min-h-[50px] sm:min-h-[60px]"
      style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
    >
      {Array.from({ length: numCols }, (_, colIndex) => renderCell(colIndex))}
    </div>
  );
};

export default ScheduleRow;
