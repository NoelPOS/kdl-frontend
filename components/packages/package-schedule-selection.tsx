"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar } from "lucide-react";
import { Course } from "@/app/types/course.type";
import {
  DAYS_OF_WEEK,
  formatDateLocal,
  generateCalendarDays,
} from "@/lib/utils";

interface PackageScheduleData {
  classMode: string;
  dates: string[];
  startTime: string;
  endTime: string;
  days?: string[]; // For fixed schedules
}

interface PackageScheduleSelectionProps {
  course: Course;
  classMode: string;
  onScheduleSelected: (schedule: PackageScheduleData) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function PackageScheduleSelection({
  course,
  classMode,
  onScheduleSelected,
  onBack,
  onCancel,
}: PackageScheduleSelectionProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  // Generate calendar days for the current month
  const calendarDays = generateCalendarDays(currentMonth);

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleDayToggle = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleNext = () => {
    const scheduleData: PackageScheduleData = {
      classMode,
      dates: selectedDates,
      startTime,
      endTime,
      days: selectedDays,
    };

    onScheduleSelected(scheduleData);
  };

  const isValid = () => {
    if (!startTime || !endTime) return false;

    if (classMode.includes("fixed")) {
      return selectedDays.length > 0;
    } else if (classMode.includes("camp")) {
      return selectedDates.length > 0;
    } else {
      return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Session Times
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Start Time</Label>
            <div
              className="relative cursor-pointer"
              onClick={() => startTimeRef.current?.showPicker()}
            >
              <Input
                ref={startTimeRef}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-gray-300 rounded-lg pr-10 cursor-pointer"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">End Time</Label>
            <div
              className="relative cursor-pointer"
              onClick={() => endTimeRef.current?.showPicker()}
            >
              <Input
                ref={endTimeRef}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-gray-300 rounded-lg pr-10 cursor-pointer"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Type Based Selection */}
      {classMode.includes("fixed") ? (
        /* Fixed Sessions - Select Days of Week */
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Days of Week
          </h4>

          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.key}
                type="button"
                variant="outline"
                className={`h-10 text-xs ${
                  selectedDays.includes(day.key)
                    ? "bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleDayToggle(day.key)}
              >
                {day.label}
              </Button>
            ))}
          </div>

          {selectedDays.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected:{" "}
              {selectedDays
                .map(
                  (dayKey) => DAYS_OF_WEEK.find((d) => d.key === dayKey)?.label
                )
                .join(", ")}
            </div>
          )}
        </div>
      ) : classMode.includes("camp") ? (
        /* Camp/Flexible - Select Specific Dates */
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Dates
          </h4>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                ←
              </Button>
              <h4 className="font-medium">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-gray-500 p-2"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((date, index) => {
                const dateStr = formatDateLocal(date);
                const isCurrentMonth =
                  date.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDates.includes(dateStr);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${
                      !isCurrentMonth
                        ? "text-gray-300 hover:bg-transparent cursor-default"
                        : isSelected
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : isToday
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => isCurrentMonth && handleDateToggle(dateStr)}
                    disabled={!isCurrentMonth}
                  >
                    {date.getDate()}
                  </Button>
                );
              })}
            </div>
          </div>
          {selectedDates.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected dates: {selectedDates.length} day
              {selectedDates.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid()}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Next: Teacher
        </Button>
      </div>
    </div>
  );
}
