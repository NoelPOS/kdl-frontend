"use client";

import { Info, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SessionOverview } from "@/app/types/session.type";

interface StudentCourseProps {
  course: SessionOverview;
}

export function StudentCourse({ course }: StudentCourseProps) {
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();
  const params = useParams();
  const handleClick = (sessionId: number) => {
    router.push(`/student/${params.id}/session/${sessionId}`);
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 relative flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 h-75 w-[220px]">
      {!isHovered ? (
        <>
          <Info
            className="absolute top-3 right-3 h-4 w-4 text-blue-400 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />

          <h3 className="font-semibold text-gray-900 mb-4 pr-6 h-20">
            {course.courseTitle}
          </h3>

          <div className="space-y-4 mb-4">
            <span
              className={`px-2 py-1 rounded-md gap-2 text-sm text-gray-600 ${
                course.payment == "Unpaid" ? "bg-yellow-400" : "bg-green-400"
              } `}
            >
              {course.payment}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.mode}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.completedCount}/12 times
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.classCancel} times cancelled
            </div>
            <div className="text-sm  text-gray-600">{course.progress}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tablet className="h-4 w-4" />
              {/* {course.device} */} Later
            </div>
          </div>

          <Button
            className="w-full bg-blue-400 hover:bg-blue-500 mt-auto"
            onClick={() => handleClick(course.sessionId)}
          >
            Details
          </Button>
        </>
      ) : (
        <div
          className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-100 p-4 flex flex-col"
          onMouseLeave={() => setIsHovered(false)}
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            {course.courseTitle}
          </h3>

          <div
            className="flex-1 overflow-y-auto text-xs text-gray-700 leading-relaxed"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <p className="whitespace-pre-line">{course.courseDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
