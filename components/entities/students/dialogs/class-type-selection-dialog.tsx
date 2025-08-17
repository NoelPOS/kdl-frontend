"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { Clock, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getCourseTypes } from "@/lib/api";
import { ClassOption, ComfirmClassScheduleData } from "@/app/types/course.type";
import { DAYS_OF_WEEK, generateCalendarDays } from "@/lib/utils";

// Constants from original dialog
const CLASS_TYPES = {
  TWELVE_TIMES_FIXED: "12 times fixed",
  FIVE_DAYS_CAMP: "5 days camp",
  TWO_DAYS_CAMP: "2 days camp",
} as const;

const WEEKDAY_HEADERS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

type FormData = {
  classTypeId: string;
  fixedStartTime?: string;
  fixedEndTime?: string;
  campStartTime?: string;
  campEndTime?: string;
};

interface ClassTypeSelectionDialogProps {
  open: boolean;
  courseId?: number;
  onClassTypeSelected: (classSchedule: ComfirmClassScheduleData) => void;
  onBack: () => void;
  onCancel: () => void;
  mode?: "create" | "assign";
}

export default function ClassTypeSelectionDialog({
  open,
  courseId,
  onClassTypeSelected,
  onBack,
  onCancel,
  mode = "create",
}: ClassTypeSelectionDialogProps) {
  const { register, handleSubmit, watch, setValue, getValues } =
    useForm<FormData>({
      defaultValues: {
        classTypeId: "",
        fixedStartTime: "",
        fixedEndTime: "",
        campStartTime: "",
        campEndTime: "",
      },
    });

  // State for day/date selection
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [courseOptions, setCourseOptions] = useState<ClassOption[]>([]);

  // Refs for time inputs
  const fixedStartTimeRef = useRef<HTMLInputElement>(null);
  const fixedEndTimeRef = useRef<HTMLInputElement>(null);
  const campStartTimeRef = useRef<HTMLInputElement>(null);
  const campEndTimeRef = useRef<HTMLInputElement>(null);

  const classTypeId = watch("classTypeId");

  // Get the selected course option object
  const selectedCourseOption = useMemo(() => {
    return courseOptions?.find(
      (option) => option.id.toString() === classTypeId
    );
  }, [courseOptions, classTypeId]);

  const classType = selectedCourseOption?.classMode;

  // Load class options
  useEffect(() => {
    const fetchCourseOptions = async () => {
      try {
        const response = await getCourseTypes();
        setCourseOptions(response);
      } catch (error) {
        console.error("Error fetching course types:", error);
      }
    };

    if (open) {
      fetchCourseOptions();
    }
  }, [open]);

  // Handle day selection for 12 times fixed
  const toggleDay = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelectedDays);
  };

  // Handle date selection for camp class
  const toggleDate = (date: string) => {
    const newSelectedDates = selectedDates.includes(date)
      ? selectedDates.filter((d) => d !== date)
      : [...selectedDates, date];
    setSelectedDates(newSelectedDates);
  };

  // Generate calendar days for the current month
  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate),
    [currentDate]
  );

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentDate);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newMonth);
  };

  const onSubmit = (data: FormData) => {
    const selectedCourseType = courseOptions?.find(
      (option) => option.id.toString() === data.classTypeId
    );

    if (!selectedCourseType) {
      alert("Please select a class type.");
      return;
    }

    // Validate based on class type
    if (selectedCourseType.classMode === CLASS_TYPES.TWELVE_TIMES_FIXED) {
      if (selectedDays.length === 0) {
        alert("Please select at least one day for 12 times fixed.");
        return;
      }
      if (!data.fixedStartTime || !data.fixedEndTime) {
        alert("Please select both start and end times for 12 times fixed.");
        return;
      }
    } else if (
      selectedCourseType.classMode === CLASS_TYPES.FIVE_DAYS_CAMP ||
      selectedCourseType.classMode === CLASS_TYPES.TWO_DAYS_CAMP
    ) {
      if (selectedDates.length === 0) {
        alert("Please select at least one date for camp class.");
        return;
      }
      if (!data.campStartTime || !data.campEndTime) {
        alert("Please select both start and end times for camp class.");
        return;
      }
    }

    // Create the class schedule data
    const classScheduleData: ComfirmClassScheduleData = {
      classType: selectedCourseType,
      fixedDays: selectedDays,
      fixedStartTime: data.fixedStartTime,
      fixedEndTime: data.fixedEndTime,
      campDates: selectedDates,
      campStartTime: data.campStartTime,
      campEndTime: data.campEndTime,
    };

    console.log("Class schedule data:", classScheduleData);
    onClassTypeSelected(classScheduleData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Class Type & Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="classTypeId">Class Type</Label>
            <div className="relative">
              <select
                id="classTypeId"
                {...register("classTypeId", { required: true })}
                className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none pr-10"
              >
                <option value="">Select a class type</option>
                {courseOptions.map((option) => (
                  <option key={option.id} value={option.id.toString()}>
                    {option.classMode} - {option.tuitionFee}THB
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 12 Times Fixed Schedule */}
          {classType === CLASS_TYPES.TWELVE_TIMES_FIXED && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">
                12 Times Fixed Schedule
              </h3>

              {/* Day Selection */}
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        selectedDays.includes(day.key)
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => fixedStartTimeRef.current?.showPicker()}
                  >
                    <Input
                      {...register("fixedStartTime")}
                      ref={(e) => {
                        register("fixedStartTime").ref(e);
                        if (e) fixedStartTimeRef.current = e;
                      }}
                      type="time"
                      className="pr-10 cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => fixedEndTimeRef.current?.showPicker()}
                  >
                    <Input
                      {...register("fixedEndTime")}
                      ref={(e) => {
                        register("fixedEndTime").ref(e);
                        if (e) fixedEndTimeRef.current = e;
                      }}
                      type="time"
                      className="pr-10 cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected days:{" "}
                  {selectedDays
                    .map(
                      (day) => DAYS_OF_WEEK.find((d) => d.key === day)?.label
                    )
                    .join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Camp Schedule */}
          {(classType === CLASS_TYPES.FIVE_DAYS_CAMP ||
            classType === CLASS_TYPES.TWO_DAYS_CAMP) && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Camp Class Schedule</h3>

              {/* Calendar */}
              <div className="space-y-2">
                <Label>Select Dates</Label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => navigateMonth("prev")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h4 className="font-medium">
                      {currentDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h4>
                    <button
                      type="button"
                      onClick={() => navigateMonth("next")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {WEEKDAY_HEADERS.map((day) => (
                      <div
                        key={day}
                        className="p-2 text-xs font-medium text-gray-500 text-center"
                      >
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((date, index) => {
                      const dateStr = date.toISOString().split("T")[0];
                      const isSelected = selectedDates.includes(dateStr);
                      const isCurrentMonth =
                        date.getMonth() === currentDate.getMonth();

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => isCurrentMonth && toggleDate(dateStr)}
                          disabled={!isCurrentMonth}
                          className={`p-2 text-sm rounded transition-colors ${
                            !isCurrentMonth
                              ? "text-gray-300 cursor-not-allowed"
                              : isSelected
                              ? "bg-yellow-500 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => campStartTimeRef.current?.showPicker()}
                  >
                    <Input
                      {...register("campStartTime")}
                      ref={(e) => {
                        register("campStartTime").ref(e);
                        if (e) campStartTimeRef.current = e;
                      }}
                      type="time"
                      className="pr-10 cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => campEndTimeRef.current?.showPicker()}
                  >
                    <Input
                      {...register("campEndTime")}
                      ref={(e) => {
                        register("campEndTime").ref(e);
                        if (e) campEndTimeRef.current = e;
                      }}
                      type="time"
                      className="pr-10 cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {selectedDates.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected dates: {selectedDates.length} day
                  {selectedDates.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
              Next
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
