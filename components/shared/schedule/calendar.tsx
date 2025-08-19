"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateLocal } from "@/lib/utils";

const WEEKDAY_HEADERS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

interface CalendarProps {
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
  calendarDays: Date[];
  label?: string;
  error?: string;
  maxSelectable?: number; // Maximum number of dates that can be selected
  classMode?: string; // To show specific camp type info
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDates,
  onToggleDate,
  currentDate,
  onNavigateMonth,
  calendarDays,
  label = "Select Dates",
  error,
  maxSelectable,
  classMode,
}) => {
  const handleDateClick = (dateStr: string) => {
    // If maxSelectable is set and we're at the limit, only allow deselection
    if (
      maxSelectable &&
      selectedDates.length >= maxSelectable &&
      !selectedDates.includes(dateStr)
    ) {
      return; // Don't allow more selections
    }
    onToggleDate(dateStr);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border rounded-lg p-3 bg-white ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h4 className="font-medium">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_HEADERS.map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          {calendarDays.map((date, index) => {
            const dateStr = formatDateLocal(date); // Use local date format instead of UTC
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isSelected = selectedDates.includes(dateStr);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0)); // Check if date is before today
            const isDisabled = !isCurrentMonth || isPastDate;
            const isMaxReached = maxSelectable
              ? selectedDates.length >= maxSelectable && !isSelected
              : false;

            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  isDisabled || isMaxReached
                    ? "text-gray-300 hover:bg-transparent cursor-not-allowed"
                    : isSelected
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : isToday
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "hover:bg-gray-100"
                } ${isPastDate && isCurrentMonth ? "line-through" : ""}`}
                onClick={() =>
                  !isDisabled && !isMaxReached && handleDateClick(dateStr)
                }
                disabled={isDisabled || isMaxReached}
                title={
                  isPastDate && isCurrentMonth
                    ? "Past dates cannot be selected"
                    : isMaxReached
                    ? `Maximum ${maxSelectable} dates can be selected`
                    : ""
                }
              >
                {date.getDate()}
              </Button>
            );
          })}
        </div>
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};
