"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, ChevronDown } from "lucide-react";

import {
  DAYS_OF_WEEK,
  formatDateLocal,
  generateCalendarDays,
} from "@/lib/utils";
import { getCourseTypes } from "@/lib/axio";

type FormData = {
  classTypeId: string; // Store the ID as string from select
  // For 12 times check
  checkStartTime?: string;
  checkEndTime?: string;
  // For 12 times fixed - new structure
  fixedDays?: string[];
  fixedStartTime?: string;
  fixedEndTime?: string;
  // For camp class - new structure
  campDates?: string[];
  campStartTime?: string;
  campEndTime?: string;
};

interface ClassScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterClassSchedule: (schedule: {
    classType: {
      id: number;
      classMode: string;
      classLimit: number;
      tuitionFee: number;
    };
    // checkStartTime?: string;
    // checkEndTime?: string;
    fixedDays?: string[];
    fixedStartTime?: string;
    fixedEndTime?: string;
    campDates?: string[];
    campStartTime?: string;
    campEndTime?: string;
  }) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

export function ClassScheduleForm({
  open,
  onOpenChange,
  afterClassSchedule,
  onBack,
  onCancel,
}: ClassScheduleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      classTypeId: "",
      // checkStartTime: "",
      // checkEndTime: "",
      fixedDays: [],
      fixedStartTime: "",
      fixedEndTime: "",
      campDates: [],
      campStartTime: "",
      campEndTime: "",
    },
  });

  // State for day selection (12 times fixed)
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // State for calendar selection (camp class)
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [courseOptions, setCourseOptions] = useState<
    {
      id: number;
      classMode: string;
      classLimit: number;
      tuitionFee: number;
    }[]
  >();

  // Refs for time inputs
  // const checkStartTimeRef = useRef<HTMLInputElement>(null);
  // const checkEndTimeRef = useRef<HTMLInputElement>(null);
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

  console.log("Class Type:", classType);

  // Handle day selection for 12 times fixed
  const toggleDay = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setValue("fixedDays", newSelectedDays);
  };

  // Handle date selection for camp class
  const toggleDate = (date: string) => {
    console.log("Toggling date:", date);
    const newSelectedDates = selectedDates.includes(date)
      ? selectedDates.filter((d) => d !== date)
      : [...selectedDates, date];

    setSelectedDates(newSelectedDates);
    setValue("campDates", newSelectedDates);
  };

  // Generate calendar days for the current month
  const calendarDays = useMemo(
    () => generateCalendarDays(currentMonth),
    [currentMonth]
  );

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);

    // Get the complete course type object
    const selectedCourse = courseOptions?.find(
      (option) => option.id.toString() === data.classTypeId
    );

    if (!selectedCourse) {
      alert("Please select a class type.");
      return;
    }

    // Validate based on class type
    if (selectedCourse.classMode === "12 times fixed") {
      if (selectedDays.length === 0) {
        alert("Please select at least one day for 12 times fixed.");
        return;
      }
      if (!data.fixedStartTime || !data.fixedEndTime) {
        alert("Please select both start and end times for 12 times fixed.");
        return;
      }
    } else if (selectedCourse.classMode === "5 days camp") {
      if (selectedDates.length === 0) {
        alert("Please select at least one date for camp class.");
        return;
      }
      if (!data.campStartTime || !data.campEndTime) {
        alert("Please select both start and end times for camp class.");
        return;
      }
    }

    // Update form data with selected days/dates and complete course object
    const updatedData = {
      classType: selectedCourse, // Complete course object
      // checkStartTime: data.checkStartTime,
      // checkEndTime: data.checkEndTime,
      fixedDays: selectedDays,
      fixedStartTime: data.fixedStartTime,
      fixedEndTime: data.fixedEndTime,
      campDates: selectedDates,
      campStartTime: data.campStartTime,
      campEndTime: data.campEndTime,
    };

    // console.log("Class Schedule Submitted:", updatedData);
    afterClassSchedule(updatedData);
    console.log("success");
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  useEffect(() => {
    const fetchCourseOptions = async () => {
      const response = await getCourseTypes();
      setCourseOptions(response);
    };

    fetchCourseOptions();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create Class Schedule
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="space-y-6">
              {/* Class Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="classType" className="text-sm font-medium">
                  Class Type
                </Label>
                <div className="relative flex flex-col">
                  <select
                    {...register("classTypeId")}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="">Select a class type</option>
                    {courseOptions &&
                      courseOptions.map(
                        (option: {
                          id: number;
                          classMode: string;
                          classLimit: number;
                          tuitionFee: number;
                        }) => (
                          <option key={option.id} value={option.id.toString()}>
                            {option.classMode}
                          </option>
                        )
                      )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 12 Times Check - Show start and end time */}
              {/* {classType === "12 times check" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    12 Times Check Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="checkStartTime"
                        className="text-xs text-gray-500"
                      >
                        Start Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => checkStartTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("checkStartTime")}
                          ref={(e) => {
                            register("checkStartTime").ref(e);
                            checkStartTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="checkEndTime"
                        className="text-xs text-gray-500"
                      >
                        End Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => checkEndTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("checkEndTime")}
                          ref={(e) => {
                            register("checkEndTime").ref(e);
                            checkEndTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* 12 Times Fixed - Day selection with start/end time */}
              {classType === "12 times fixed" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    12 Times Fixed Schedule
                  </h3>

                  {/* Day Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Select Days</Label>
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
                          onClick={() => toggleDay(day.key)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Start Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => fixedStartTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("fixedStartTime")}
                          ref={(e) => {
                            register("fixedStartTime").ref(e);
                            fixedStartTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">End Time</Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => fixedEndTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("fixedEndTime")}
                          ref={(e) => {
                            register("fixedEndTime").ref(e);
                            fixedEndTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
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
                          (day) =>
                            DAYS_OF_WEEK.find((d) => d.key === day)?.label
                        )
                        .join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Camp Class - Calendar selection with start/end time */}
              {(classType === "5 days camp" || classType === "2 days camp") && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    Camp Class Schedule
                  </h3>

                  {/* Calendar */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">
                      Select Dates
                    </Label>
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
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="text-xs font-medium text-gray-500 p-2"
                            >
                              {day}
                            </div>
                          )
                        )}
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
                              onClick={() =>
                                isCurrentMonth && toggleDate(dateStr)
                              }
                              disabled={!isCurrentMonth}
                            >
                              {date.getDate()}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Start Time
                      </Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => campStartTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("campStartTime")}
                          ref={(e) => {
                            register("campStartTime").ref(e);
                            campStartTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">End Time</Label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => campEndTimeRef.current?.showPicker()}
                      >
                        <Input
                          {...register("campEndTime")}
                          ref={(e) => {
                            register("campEndTime").ref(e);
                            campEndTimeRef.current = e;
                          }}
                          type="time"
                          className="border-gray-300 rounded-lg pr-10 cursor-pointer"
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
            </div>

            <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
              <div className="flex gap-2 flex-1">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-500 border-gray-500 hover:bg-gray-50 hover:text-gray-600 rounded-full flex-1"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                className="bg-green-500 text-white hover:bg-green-600 rounded-full flex-1"
              >
                Next
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClassScheduleForm;
