"use client";

import React, { useState } from "react";
import { FeedbackItem } from "@/app/types/feedback.type";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import EditFeedbackDialog from "../dialogs/edit-feedback-dialog";

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onFeedbackUpdate?: (updatedFeedback: FeedbackItem) => void;
}

export default function FeedbackCard({
  feedback,
  onFeedbackUpdate,
}: FeedbackCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(feedback);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStudentInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFeedbackUpdate = (updatedFeedback: FeedbackItem) => {
    setCurrentFeedback(updatedFeedback);
    if (onFeedbackUpdate) {
      onFeedbackUpdate(updatedFeedback);
    }
  };

  // Check if feedback is verified
  const isVerified = currentFeedback.verifyFb === true;

  return (
    <>
      <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-4">
          {/* Header with student info and date/teacher info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {currentFeedback.studentProfilePicture ? (
                <Image
                  src={currentFeedback.studentProfilePicture}
                  alt={currentFeedback.studentName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    // Handle image load error by hiding the img and showing initials
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getStudentInitials(currentFeedback.studentName)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {currentFeedback.studentName}
                </h3>
              </div>
            </div>

            {/* Date and teacher info - now on the right */}
            <div className="text-right text-xs text-gray-600">
              <div className="mb-1">
                Written on {formatDate(currentFeedback.feedbackDate)}
              </div>
              <div>by {currentFeedback.teacherName}</div>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-800 mt-1">
            {currentFeedback.courseTitle}
          </div>

          {/* Feedback content */}
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <div className="text-xs text-gray-500 mb-1">Feedback</div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {currentFeedback.feedback}
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Verify Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditFeedbackDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        feedback={currentFeedback}
        onFeedbackUpdate={handleFeedbackUpdate}
      />
    </>
  );
}
