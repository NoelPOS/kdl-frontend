"use client";

import React, { useState, useEffect } from "react";
import { FormData } from "@/app/types/schedule.type";
import { updateSchedule } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  MessageSquare,
} from "lucide-react";

interface TeacherEditScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormData;
  onScheduleUpdate: (schedule: FormData) => void;
}

export default function TeacherEditScheduleDialog({
  open,
  onOpenChange,
  initialData,
  onScheduleUpdate,
}: TeacherEditScheduleProps) {
  const [formData, setFormData] = useState<FormData>({
    scheduleId: 0,
    date: "",
    starttime: "",
    endtime: "",
    course: "",
    teacher: "",
    student: "",
    room: "",
    nickname: "",
    remark: "",
    status: "",
    courseId: 0,
    studentId: 0,
    warning: "",
  });

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPreviousFeedback, setHasPreviousFeedback] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log("Setting initial data:", initialData); // Debug log
      setFormData(initialData);
      const existingFeedback = initialData.feedback || "";
      setFeedback(existingFeedback);
      setHasPreviousFeedback(!!existingFeedback.trim()); // Check if feedback already exists
    }
  }, [initialData]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        scheduleId: 0,
        date: "",
        starttime: "",
        endtime: "",
        course: "",
        teacher: "",
        student: "",
        room: "",
        nickname: "",
        remark: "",
        status: "",
        courseId: 0,
        studentId: 0,
        warning: "",
      });
      setFeedback("");
      setIsSubmitting(false);
      setHasPreviousFeedback(false); // Reset feedback state
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheduleId) return;

    setIsSubmitting(true);
    try {
      // Prepare update data
      const updateData: {
        attendance: string;
        feedback?: string;
        feedbackDate?: string;
      } = {
        attendance: formData.status || "pending",
      };

      // Only include feedback in update if it hasn't been provided before
      if (!hasPreviousFeedback && feedback.trim()) {
        updateData.feedback = feedback;
        updateData.feedbackDate = new Date().toISOString(); // Add current timestamp
      }

      const updatedSchedule = await updateSchedule(
        formData.scheduleId,
        updateData
      );

      // Update the form data with the new values
      const updatedFormData = {
        ...formData,
        status: formData.status,
        feedback: hasPreviousFeedback ? formData.feedback : feedback, // Keep existing feedback if already provided
      };

      onScheduleUpdate(updatedFormData);
      onOpenChange(false);

      // Optional: Show success message
      console.log("Schedule updated successfully");
      showToast.success("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      showToast.error("Failed to update schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Schedule</DialogTitle>
          <DialogDescription>
            Update attendance status and provide feedback for this session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only Session Information */}
          {/* <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input value={formData.date} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  value={`${formData.starttime} - ${formData.endtime}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Course
                </Label>
                <Input
                  value={formData.course}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Room
                </Label>
                <Input value={formData.room} disabled className="bg-gray-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </Label>
              <Input
                value={`${formData.student} (${formData.nickname})`}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div> */}

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-yellow-700"
              >
                Attendance Status *
              </Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-yellow-300 focus:border-yellow-500 w-full">
                  <SelectValue
                    placeholder={
                      formData.status
                        ? formData.status.charAt(0).toUpperCase() +
                          formData.status.slice(1)
                        : "Select attendance status"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="feedback"
                className="text-sm font-medium text-yellow-700 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Teacher Feedback
                {hasPreviousFeedback && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Previously Completed
                  </span>
                )}
              </Label>

              {hasPreviousFeedback ? (
                // Show existing feedback as read-only
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <p className="text-sm text-gray-700">{feedback}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Feedback has already been provided and cannot be modified.
                  </p>
                </div>
              ) : (
                // Show editable feedback field
                <>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback about the student's performance, participation, or any notes for this session..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none border-yellow-300 focus:border-yellow-500"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {feedback.length}/500 characters
                  </p>
                </>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.status}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
