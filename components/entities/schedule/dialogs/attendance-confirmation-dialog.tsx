"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User, Calendar, Clock } from "lucide-react";
import { ClassSchedule } from "@/app/types/schedule.type";

interface AttendanceConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schedule: ClassSchedule | null;
  action: "confirmed" | "cancelled";
  isLoading: boolean;
}

export default function AttendanceConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  schedule,
  action,
  isLoading,
}: AttendanceConfirmationDialogProps) {
  if (!schedule) return null;

  const actionIcon = action === "confirmed" ? CheckCircle : XCircle;
  const actionColor = action === "confirmed" ? "text-green-600" : "text-red-600";
  const actionBgColor = action === "confirmed" ? "bg-green-50" : "bg-red-50";
  const actionText = action === "confirmed" ? "Confirmed" : "Cancelled";
  const confirmButtonColor = action === "confirmed" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-600 hover:bg-red-700";

  const ActionIcon = actionIcon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">

        {/* Student & Schedule Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">
                {schedule.student_name}
                {schedule.student_nickname && (
                  <span className="text-gray-500 ml-1">({schedule.student_nickname})</span>
                )}
              </p>
              <p className="text-sm text-gray-600">{schedule.course_title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Calendar className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {new Date(schedule.schedule_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">
                  {schedule.schedule_startTime} - {schedule.schedule_endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Current Status Warning */}
          {schedule.schedule_attendance && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Current Status:</span>{" "}
                <span className="capitalize">{schedule.schedule_attendance}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${confirmButtonColor} text-white`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <ActionIcon className="h-4 w-4 mr-2" />
                Mark as {actionText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}