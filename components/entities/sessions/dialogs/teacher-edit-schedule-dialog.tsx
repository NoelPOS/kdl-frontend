"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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

interface FormInputs {
  status: string;
  feedback: string;
}

export default function TeacherEditScheduleDialog({
  open,
  onOpenChange,
  initialData,
  onScheduleUpdate,
}: TeacherEditScheduleProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormInputs>({
    defaultValues: {
      status: "",
      feedback: "",
    },
  });

  const feedbackValue = watch("feedback");
  const hasPreviousFeedback = !!(initialData?.feedback?.trim());

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setValue("status", initialData.status || "");
      setValue("feedback", initialData.feedback || "");
    }
  }, [initialData, setValue]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({
        status: "",
        feedback: "",
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormInputs) => {
    if (!initialData?.scheduleId) return;

    try {
      // Prepare update data
      const updateData: {
        attendance: string;
        feedback?: string;
        feedbackDate?: string;
      } = {
        attendance: data.status || "pending",
      };

      // Only include feedback in update if it hasn't been provided before
      if (!hasPreviousFeedback && data.feedback.trim()) {
        updateData.feedback = data.feedback;
        updateData.feedbackDate = new Date().toISOString(); // Add current timestamp
      }

      await updateSchedule(initialData.scheduleId, updateData);

      // Update the form data with the new values
      const updatedFormData = {
        ...initialData,
        status: data.status,
        feedback: hasPreviousFeedback ? initialData.feedback : data.feedback, // Keep existing feedback if already provided
      };

      onScheduleUpdate(updatedFormData);
      onOpenChange(false);

      showToast.success("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      showToast.error("Failed to update schedule. Please try again.");
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-yellow-700"
              >
                Attendance Status *
              </Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Attendance status is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-yellow-300 focus:border-yellow-500 w-full">
                      <SelectValue
                        placeholder={
                          field.value
                            ? field.value.charAt(0).toUpperCase() +
                              field.value.slice(1)
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
                )}
              />
              {errors.status && (
                <p className="text-xs text-red-600">{errors.status.message}</p>
              )}
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
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <p className="text-sm text-gray-700">{feedbackValue}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Feedback has already been provided and cannot be modified.
                  </p>
                </div>
              ) : (
                <>
                  <Controller
                    name="feedback"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="feedback"
                        placeholder="Provide feedback about the student's performance, participation, or any notes for this session..."
                        rows={4}
                        className="resize-none border-yellow-300 focus:border-yellow-500"
                        maxLength={500}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    {feedbackValue.length}/500 characters
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
            disabled={isSubmitting || !watch("status")}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
