"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimeInputProps {
  label: string;
  register: any;
  fieldName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClick: () => void;
  error?: string;
  required?: boolean;
  validation?: any;
  min?: string; // Minimum time (e.g., "00:00")
  max?: string; // Maximum time (e.g., "23:59")
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  register,
  fieldName,
  inputRef,
  onClick,
  error,
  required = false,
  validation = {},
  min = "00:00",
  max = "23:59",
}) => (
  <div className="space-y-1">
    <Label className={` ${error ? "text-red-500" : "text-black"}`}>
      {label} {required && "*"}
    </Label>
    <div className="relative cursor-pointer" onClick={onClick}>
      <Input
        {...register(fieldName, validation)}
        ref={(e) => {
          register(fieldName, validation).ref(e);
          if (e) inputRef.current = e;
        }}
        type="time"
        min={min}
        max={max}
        className={`border-black rounded-lg pr-10 cursor-pointer ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
    </div>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);
