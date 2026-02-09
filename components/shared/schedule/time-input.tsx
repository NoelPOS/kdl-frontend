"use client";

import { Label } from "@/components/ui/label";
import { Clock, ChevronDown } from "lucide-react";

interface TimeInputProps {
  label: string;
  register: any;
  fieldName: string;
  inputRef?: React.RefObject<HTMLInputElement | null>; // Optional - kept for backwards compatibility
  onClick?: () => void; // Optional - kept for backwards compatibility
  error?: string;
  required?: boolean;
  validation?: any;
  min?: string; // Minimum time (e.g., "00:00")
  max?: string; // Maximum time (e.g., "23:59")
}

// Generate time options in 30-minute intervals
const generateTimeOptions = (min: string = "00:00", max: string = "23:59"): string[] => {
  const options: string[] = [];
  const [minHour, minMinute] = min.split(":").map(Number);
  const [maxHour, maxMinute] = max.split(":").map(Number);
  
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const timeValue = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      
      // Check if within min/max bounds
      const currentMinutes = hour * 60 + minute;
      const minTotalMinutes = minHour * 60 + minMinute;
      const maxTotalMinutes = maxHour * 60 + maxMinute;
      
      if (currentMinutes >= minTotalMinutes && currentMinutes <= maxTotalMinutes) {
        options.push(timeValue);
      }
    }
  }
  
  return options;
};

// Format time for display (e.g., "09:00" -> "9:00 AM")
const formatTimeDisplay = (time: string): string => {
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  register,
  fieldName,
  error,
  required = false,
  validation = {},
  min = "00:00",
  max = "23:59",
}) => {
  const timeOptions = generateTimeOptions(min, max);
  
  return (
    <div className="space-y-1">
      <Label className={` ${error ? "text-red-500" : "text-black"}`}>
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <select
          {...register(fieldName, validation)}
          className={`w-full border rounded-md py-1.5 px-2 pr-10 appearance-none cursor-pointer ${
            error ? "border-red-500 focus:border-red-500" : "border-black"
          }`}
          style={{ fontSize: "0.875rem" }}
        >
          <option value="" disabled hidden>
            Select time
          </option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {formatTimeDisplay(time)}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <Clock className="h-4 w-4 text-black" />
          <ChevronDown className="h-4 w-4 text-black" />
        </div>
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};
