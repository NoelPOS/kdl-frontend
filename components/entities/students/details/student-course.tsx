"use client";

import { Info, Tablet, Plus, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SessionOverview } from "@/app/types/session.type";
import { Student } from "@/app/types/course.type";
import { CoursePlusDialog } from "../dialogs/course-plus.dialog";
import AssignCourseFlow from "../dialogs/assign-course-flow";
import SwapScheduleFlow from "../dialogs/swap-schedule-flow";
import { CommentDialog } from "../dialogs/comment.dialog";

interface StudentCourseProps {
  course: SessionOverview;
  student?: Student; // Add optional student data prop
}

export function StudentCourse({ course, student }: StudentCourseProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentComment, setCurrentComment] = useState(course.comment || "");

  const router = useRouter();
  const params = useParams();

  const handleClick = (sessionId: number) => {
    router.push(`/student/${params.id}/session/${sessionId}`);
  };

  const handleCommentUpdate = (newComment: string) => {
    setCurrentComment(newComment);
  };

  // Check if this is a TBC (To Be Confirmed) course
  const isTBCCourse = course.courseTitle?.toLowerCase() === "tbc" ;
  const isFreeTrial = course.courseTitle?.toLowerCase() === "free trial";

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 relative flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[350px] max-h-[400px] w-[250px]">
      {!isHovered ? (
        <div className="flex flex-col h-full">
          <Info
            className="absolute top-3 right-3 h-4 w-4 text-blue-400 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />

          <h3 className="font-semibold text-gray-900 pr-6 h-15">
            {course.courseTitle}
          </h3>

          <div className="space-y-3 mb-4 flex-1">
            {/* Payment and Status badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  course.payment === "Unpaid"
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-blue-400 text-blue-900"
                }`}
              >
                Payment: {course.payment}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.mode}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.completedCount}/{course.mode.split(" ")[0]} times
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {course.classCancel} times cancelled
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Status: {course.status}
            </div>
            {/* <div className="text-sm text-gray-600">{course.progress}</div> */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tablet className="h-4 w-4" />
              {course.medium}
            </div>
            {/* Comment section - only show if comment exists */}
            {currentComment && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">{currentComment}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-2 space-y-2">
            {/* Show different buttons based on whether it's a TBC course */}
            {isTBCCourse ? (
              <>
                <AssignCourseFlow
                  session={course}
                  studentId={Number(params.id)}
                  studentData={student}
                  trigger={
                    <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Assign Course
                    </Button>
                  }
                />
                <CommentDialog
                  sessionId={course.sessionId}
                  currentComment={currentComment}
                  onCommentUpdate={handleCommentUpdate}
                />
              </>
            ) : isFreeTrial ? (
                <Button
                  className="bg-blue-400 hover:bg-blue-500 text-white w-full"
                  onClick={() => handleClick(course.sessionId)}
                >
                  Details
                </Button>
            ) : (
              <>
                <Button
                  className="bg-blue-400 hover:bg-blue-500 text-white w-full"
                  onClick={() => handleClick(course.sessionId)}
                >
                  Details
                </Button>
                {/* Only show Course Plus for active sessions */}
                {course.status?.toLowerCase() !== "completed" &&
                  course.status?.toLowerCase() !== "cancelled" && (
                    <>
                      <SwapScheduleFlow
                        session={course}
                        studentId={Number(params.id)}
                        studentData={student}
                        trigger={
                          <Button 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Swap Schedule
                          </Button>
                        }
                      />
                      <CoursePlusDialog course={course} />
                    </>
                  )}
              </>
            )}
          </div>
        </div>
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
            {isTBCCourse ? (
              <div className="text-center text-gray-600">
                <p className="mb-2">This is a blank course session.</p>
                <p>
                  Click Assign Course to select a specific course, teacher, and
                  class type.
                </p>
              </div>
            ) : (
              <p className="whitespace-pre-line">{course.courseDescription}</p>
            )}
            {isTBCCourse ? (
              <div className="text-center text-gray-600">
                <p className="mb-2">This is a blank course session.</p>
                <p>
                  Click Assign Course to select a specific course, teacher, and
                  class type.
                </p>
              </div>
            ) : (
              <p className="whitespace-pre-line">{course.courseDescription}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
