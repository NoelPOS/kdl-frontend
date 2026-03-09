"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useSearchCourses } from "@/hooks/query/use-courses";
import { checkStudentHasWipSession } from "@/lib/api";
import { Course } from "@/app/types/course.type";
import { showToast } from "@/lib/toast";
import type { StepPanelProps } from "../types";

interface Step2Props extends StepPanelProps {
  studentId?: number;
}

export function Step2Course({ data, onChange, onValidChange, studentId }: Step2Props) {
  const [searchQuery, setSearchQuery] = useState(data.courseTitle || "");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const { data: searchResults = [] } = useSearchCourses(debouncedQuery);
  const [selectedCourse, setSelectedCourse] = useState<Pick<Course, "id" | "title"> | null>(
    data.courseId && data.courseTitle
      ? { id: data.courseId, title: data.courseTitle }
      : null
  );

  // Initial validity
  useEffect(() => {
    onValidChange(!!selectedCourse);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectCourse = useCallback(
    async (course: Course) => {
      // WIP check
      if (studentId) {
        try {
          const { hasWipSession } = await checkStudentHasWipSession(
            studentId,
            course.id
          );
          if (hasWipSession) {
            showToast.error(
              `Student is already attending "${course.title}".`
            );
            return;
          }
        } catch {
          showToast.error("Failed to check enrollment status.");
          return;
        }
      }

      setSelectedCourse(course);
      setSearchQuery(course.title);
      onChange({
        courseId: course.id,
        courseTitle: course.title,
      });
      onValidChange(true);
    },
    [studentId, onChange, onValidChange]
  );

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (selectedCourse) {
      setSelectedCourse(null);
      onChange({ courseId: undefined, courseTitle: undefined });
      onValidChange(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Select Course
        </h3>
        <p className="text-sm text-muted-foreground">
          Search and select the course to enroll in.
        </p>
      </div>

      <div className="space-y-2 relative">
        <Label className="text-sm font-medium">Course Name</Label>
        <div className="relative">
          <Input
            value={searchQuery}
            placeholder="Search for a course..."
            onChange={(e) => handleInputChange(e.target.value)}
            autoComplete="off"
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {!selectedCourse && searchResults.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 shadow-[var(--shadow-md)] w-full rounded-lg mt-1 max-h-60 overflow-y-auto">
            {searchResults.map((course) => (
              <li
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">
                  {course.title}
                </span>
                {course.ageRange && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({course.ageRange})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCourse && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800">
            Selected: {selectedCourse.title}
          </p>
        </div>
      )}
    </div>
  );
}
