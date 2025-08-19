"use client";

import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

interface ClassTypeSelectProps {
  register: any;
  fieldName: string;
  options: Array<{ id: number; classMode: string }>;
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  validation?: any;
}

export const ClassTypeSelect: React.FC<ClassTypeSelectProps> = ({
  register,
  fieldName,
  options,
  label = "Class Type",
  error,
  placeholder = "Select a class type",
  required = false,
  validation = {},
}) => (
  <div className="space-y-2">
    <Label
      htmlFor={fieldName}
      className={`text-sm font-medium ${error ? "text-red-500" : ""}`}
    >
      {label} {required && "*"}
    </Label>
    <div className="relative">
      <select
        id={fieldName}
        {...register(fieldName, validation)}
        className={`w-full border rounded-lg py-2 px-3 text-sm appearance-none ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id.toString()}>
            {option.classMode}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);
