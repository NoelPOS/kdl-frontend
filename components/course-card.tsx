"use client";

import { Info, Smile, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { courseDescription } from "@/lib/data";

type Course = {
  name: string;
  ageRange: string;
  device: string;
  currency: string;
  price: number;
  description?: string;
};

interface CourseCardProps {
  course: Course;
  onAddStudent?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CourseCard({ course, onOpenChange }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddStudent = () => {
    // set the query on the website to course name so that I can use it in the add student dialog
    const query = new URLSearchParams();
    query.set("course", course.name);

    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `?${query.toString()}`);
    }

    if (onOpenChange) {
      onOpenChange(true);
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 relative flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 h-64">
      {!isHovered ? (
        <>
          <Info
            className="absolute top-3 right-3 h-4 w-4 text-blue-400 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />

          <h3 className="font-semibold text-gray-900 mb-4 pr-6">
            {course.name}
          </h3>

          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smile className="h-4 w-4" />
              {course.ageRange}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tablet className="h-4 w-4" />
              {course.device}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {course.currency} {course.price.toLocaleString()}
            </div>
          </div>

          <Button
            className="w-full bg-blue-400 hover:bg-blue-500 mt-auto"
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </>
      ) : (
        <div
          className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-100 p-4 flex flex-col"
          onMouseLeave={() => setIsHovered(false)}
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            {course.name}
          </h3>

          <div
            className="flex-1 overflow-y-auto text-xs text-gray-700 leading-relaxed"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <p className="whitespace-pre-line">{courseDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
