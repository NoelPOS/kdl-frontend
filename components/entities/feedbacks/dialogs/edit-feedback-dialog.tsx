"use client";

import React, { useState, useEffect } from "react";
import { FeedbackItem } from "@/app/types/feedback.type";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, BookOpen, Calendar } from "lucide-react";
import Image from "next/image";

interface EditFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: FeedbackItem | null;
  onFeedbackUpdate: (updatedFeedback: FeedbackItem) => void;
}

export default function EditFeedbackDialog({
  open,
  onOpenChange,
  feedback,
  onFeedbackUpdate,
}: EditFeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (feedback && open) {
      setFeedbackText(feedback.feedback || "");
    }
  }, [feedback, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFeedbackText("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      // Import the updateFeedback API function
      const { updateFeedback } = await import("@/lib/api/feedbacks");

      // Call the API to update feedback - this will verify and remove it
      const response = await updateFeedback(
        feedback.scheduleId,
        feedbackText.trim()
      );

      if (response.success) {
        // Since the feedback is now verified, create a "fake" feedback item
        // with verifyFb = true to trigger removal from the list
        const verifiedFeedback: FeedbackItem = {
          ...feedback,
          feedback: feedbackText.trim(),
          verifyFb: true, // This will trigger removal from the list
        };

        onFeedbackUpdate(verifiedFeedback);
        onOpenChange(false);

        // Show success message
        showToast.success(
          response.message || "Feedback verified successfully!"
        );
      } else {
        throw new Error(response.message || "Failed to verify feedback");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);

      // Extract error message from axios error or use default
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update feedback. Please try again.";

      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Edit Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session Information */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {/* Student Info */}
            <div className="flex items-center gap-3">
              {feedback.studentProfilePicture ? (
                <Image
                  src={feedback.studentProfilePicture}
                  alt={feedback.studentName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getStudentInitials(feedback.studentName)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {feedback.studentName}
                  {feedback.studentNickname && (
                    <span className="text-gray-500 font-normal ml-1">
                      ({feedback.studentNickname})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{feedback.courseTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(feedback.sessionDate)}</span>
              </div>
            </div>
          </div>

          {/* Editable Feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                id="feedback"
                placeholder="Enter detailed feedback about the student's performance, participation, or any notes for this session..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                className="resize-none border-yellow-300 focus:border-yellow-500"
                maxLength={1000}
                required
              />
            </div>
          </div>
        </form>

        <DialogFooter className="justify-end">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedbackText.trim()}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? "Updating..." : "Update & Verify Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
