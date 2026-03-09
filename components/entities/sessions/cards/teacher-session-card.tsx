"use client";

import { Info, Tablet, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionOverview } from "@/app/types/session.type";
import TeacherFeedbackDialog from "../dialogs/teacher-feedback-dialog";

interface TeacherSessionCardProps {
  session: SessionOverview;
}

export default function TeacherSessionCard({
  session,
}: TeacherSessionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = (sessionId: number) => {
    router.push(`/session/${sessionId}`);
  };

  // Helper function to get status display name
  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "wip":
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  // Helper function to get status color classes
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "wip":
      case "in-progress":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-400 text-gray-900";
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 relative flex flex-col shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 min-h-[350px] max-h-[400px] w-[250px]">
      {!isHovered ? (
        <div className="flex flex-col h-full">
          <Info
            className="absolute top-3 right-3 h-4 w-4 text-blue-400 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />

          <h3 className="font-semibold text-gray-900 pr-6 h-15">
            {session.courseTitle}
          </h3>

          <div className="space-y-3 mb-4 flex-1">
            {/* Status badge */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  session.status
                )}`}
              >
                Status: {getStatusDisplay(session.status)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              {session.mode}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Progress: {session.completedCount}/{session.mode.split(" ")[0]}{" "}
              classes
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Cancelled: {session.classCancel} times
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tablet className="h-4 w-4" />
              {session.medium}
            </div>
          </div>

          <div className="mt-auto pt-2 space-y-2">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white w-full shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-150"
              onClick={() => handleClick(session.sessionId)}
            >
              View Details
            </Button>

            {/* Feedback button for completed or in-progress sessions */}
            {(session.status?.toLowerCase() === "completed" ||
              session.status?.toLowerCase() === "wip" ||
              session.status?.toLowerCase() === "in-progress") && (
              <TeacherFeedbackDialog session={session} />
            )}
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 bg-blue-50 rounded-xl border border-blue-100 p-4 flex flex-col"
          onMouseLeave={() => setIsHovered(false)}
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            {session.courseTitle}
          </h3>

          <div
            className="flex-1 overflow-y-auto text-xs text-gray-700 leading-relaxed"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <p className="whitespace-pre-line">{session.courseDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
