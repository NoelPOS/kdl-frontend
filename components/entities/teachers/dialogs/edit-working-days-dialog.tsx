"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EditWorkingDaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDays: string[];
  currentType: string;
  onSave: (days: string[], type: string) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function EditWorkingDaysDialog({
  open,
  onOpenChange,
  currentDays,
  currentType,
  onSave,
}: EditWorkingDaysDialogProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(currentDays);
  const [teacherType, setTeacherType] = useState(currentType || "full-time");
  const [isSaving, setIsSaving] = useState(false);

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setSelectedDays([...selectedDays, day]);
    } else {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedDays, teacherType);
    } finally {
      setIsSaving(false);
    }
  };

  const selectWeekdays = () => {
    setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  };

  const selectAll = () => {
    setSelectedDays([...DAYS_OF_WEEK]);
  };

  const clearAll = () => {
    setSelectedDays([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Work Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Teacher Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Teacher Type</Label>
            <RadioGroup
              value={teacherType}
              onValueChange={setTeacherType}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full-time" id="full-time" />
                <Label htmlFor="full-time" className="cursor-pointer">
                  Full-time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="part-time" id="part-time" />
                <Label htmlFor="part-time" className="cursor-pointer">
                  Part-time
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Working Days */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Working Days</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectWeekdays}
                >
                  Weekdays
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked) =>
                      handleDayToggle(day, checked as boolean)
                    }
                  />
                  <Label htmlFor={day} className="cursor-pointer">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
