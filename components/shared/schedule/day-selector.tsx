"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DAYS_OF_WEEK } from "@/lib/utils";

interface DaySelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
  label?: string;
  error?: string;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
  label = "Select Days",
  error,
}) => (
  <div className="space-y-2">
    <Label className={`text-sm ${error ? "text-red-500" : "text-gray-700"}`}>
      {label} *
    </Label>
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map((day) => (
        <Button
          key={day.key}
          type="button"
          variant="outline"
          className={`h-10 text-xs cursor-pointer ${
            selectedDays.includes(day.key)
              ? "bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500"
              : "hover:bg-gray-100"
          } ${error ? "border-red-500" : ""}`}
          onClick={() => onToggleDay(day.key)}
        >
          {day.label}
        </Button>
      ))}
    </div>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);
