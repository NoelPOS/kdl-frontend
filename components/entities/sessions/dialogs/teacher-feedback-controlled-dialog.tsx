"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TeacherFeedbackControlledDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  studentName: string;
}

export default function TeacherFeedbackControlledDialog({
  isOpen,
  onClose,
  onSubmit,
  studentName,
}: TeacherFeedbackControlledDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset feedback when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFeedback("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback("");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Student Feedback</DialogTitle>
          <DialogDescription>
            Share your feedback about {studentName}&apos;s performance in this
            session.
          </DialogDescription>
        </DialogHeader>

        {/* Student Preview Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{studentName}</h3>
              <p className="text-sm text-gray-600">Student Feedback</p>
            </div>
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-2">
          <label
            htmlFor="feedback"
            className="text-sm font-medium text-gray-900"
          >
            Your Feedback
          </label>
          <Textarea
            id="feedback"
            placeholder="Enter your feedback about the student's performance, areas for improvement, strengths, etc..."
            value={feedback}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFeedback(e.target.value)
            }
            rows={4}
            className="resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {feedback.length}/500 characters
          </p>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
