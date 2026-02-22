"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherAbsence } from "@/app/types/teacher.type";
import {
  useCreateTeacherAbsence,
  useUpdateTeacherAbsence,
} from "@/hooks/mutation/use-teacher-mutations";
import { showToast } from "@/lib/toast";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

interface TeacherAbsenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number;
  absence: TeacherAbsence | null;
  onSaved: () => void;
}

export function TeacherAbsenceDialog({
  open,
  onOpenChange,
  teacherId,
  absence,
  onSaved,
}: TeacherAbsenceDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const isEditing = !!absence;

  const { mutate: createAbsence, isPending: isCreating } =
    useCreateTeacherAbsence();
  const { mutate: updateAbsence, isPending: isUpdating } =
    useUpdateTeacherAbsence();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (absence) {
        setSelectedDate(new Date(absence.absenceDate));
        setReason(absence.reason || "");
      } else {
        setSelectedDate(undefined);
        setReason("");
      }
    }
  }, [open, absence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      showToast.error("Please select a date");
      return;
    }

    // Fix: Use local date to avoid timezone shift (toISOString uses UTC)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    if (isEditing && absence) {
      updateAbsence(
        {
          teacherId,
          absenceId: absence.id,
          data: { absenceDate: dateString, reason: reason || undefined },
        },
        { onSuccess: onSaved }
      );
    } else {
      createAbsence(
        {
          teacherId,
          data: { absenceDate: dateString, reason: reason || undefined },
        },
        { onSuccess: onSaved }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Absence" : "Add Absence Date"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Calendar22 date={selectedDate} onChange={setSelectedDate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Holiday, etc."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isSaving ? "Saving..." : isEditing ? "Update" : "Add Absence"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
