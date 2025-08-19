"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { searchCourses } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";
import { Course } from "@/app/types/course.type";

interface PackageCourseSelectionProps {
  onCourseSelected: (course: Course) => void;
  onCancel: () => void;
}

export function PackageCourseSelection({
  onCourseSelected,
  onCancel,
}: PackageCourseSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const debouncedSearch = useDebouncedCallback(async (value: string) => {
    if (value.length >= 2) {
      try {
        const results = await searchCourses(value);
        console.log("Search results:", results);
        setSearchResults(results);
      } catch (err) {
        console.error("Course search failed", err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedCourse(null);
    debouncedSearch(value);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSearchQuery(course.title);
    setSearchResults([]);
  };

  const handleNext = () => {
    if (selectedCourse) {
      onCourseSelected(selectedCourse);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Step 1: Select Course
        </h3>
        <p className="text-sm text-gray-600">
          Search and select which course to apply this package to
        </p>
      </div> */}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-search" className="text-sm font-medium">
            Course Name
          </Label>
          <div className="relative">
            <Input
              id="course-search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for a course..."
              className="w-full pr-10"
              autoComplete="off"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {course.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Course Display */}
        {selectedCourse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900">
                  {selectedCourse.title}
                </h4>
              </div>
              <div className="text-blue-600 text-sm font-medium">Selected</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedCourse}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Next: Schedule
        </Button>
      </div>
    </div>
  );
}
