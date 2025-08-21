"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCourseTypes } from "@/lib/api";
import { ClassOption, ComfirmClassScheduleData } from "@/app/types/course.type";
import { DAYS_OF_WEEK, generateCalendarDays } from "@/lib/utils";
import {
  Calendar,
  DaySelector,
  TimeInput,
  ClassTypeSelect,
} from "@/components/shared/schedule";
import {
  getTimeValidationRules,
  BUSINESS_HOURS,
  getCampDateValidationMessage,
  getRequiredCampDateCount,
} from "@/lib/validation-utils";

// Constants from original dialog
const CLASS_TYPES = {
  TWELVE_TIMES_FIXED: "12 times fixed",
  FIVE_DAYS_CAMP: "5 days camp",
  TWO_DAYS_CAMP: "2 days camp",
} as const;

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
  mode?: "create" | "assign";
}

export default function ClassTypeSelectionDialog({
  open,
  courseId,
  onClassTypeSelected,
  onBack,

  mode = "create",
}: ClassTypeSelectionDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    try {
      const selectedCourseType = courseOptions?.find(
        (option) => option.id.toString() === data.classTypeId
      );

      if (!selectedCourseType) {
        showToast.error("Please select a class type.");
        return;
      }

      // Validate day/date selection with detailed toast messages
      if (selectedCourseType.classMode === CLASS_TYPES.TWELVE_TIMES_FIXED) {
        if (selectedDays.length === 0) {
          showToast.error(
            "Please select at least one day for the fixed schedule."
          );
          return;
        }

        // Validate time selection for fixed schedule
        if (!data.fixedStartTime) {
          showToast.error("Please select a start time for the fixed schedule.");
          return;
        }

        if (!data.fixedEndTime) {
          showToast.error("Please select an end time for the fixed schedule.");
          return;
        }
      } else if (
        selectedCourseType.classMode === CLASS_TYPES.FIVE_DAYS_CAMP ||
        selectedCourseType.classMode === CLASS_TYPES.TWO_DAYS_CAMP
      ) {
        const requiredCount = getRequiredCampDateCount(
          selectedCourseType.classMode
        );

        if (selectedDates.length === 0) {
          showToast.error(
            `Please select dates for the ${selectedCourseType.classMode.toLowerCase()}.`
          );
          return;
        }

        if (selectedDates.length < requiredCount) {
          showToast.error(
            `Please select ${requiredCount} dates for ${selectedCourseType.classMode.toLowerCase()}. You have selected ${
              selectedDates.length
            }.`
          );
          return;
        }

        if (selectedDates.length > requiredCount) {
          showToast.error(
            `Too many dates selected! Please select exactly ${requiredCount} dates for ${selectedCourseType.classMode.toLowerCase()}.`
          );
          return;
        }

        // Validate time selection for camp
        if (!data.campStartTime) {
          showToast.error("Please select a start time for the camp schedule.");
          return;
        }

        if (!data.campEndTime) {
          showToast.error("Please select an end time for the camp schedule.");
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

      showToast.success(
        "Class schedule configured!",
        "Your class schedule has been set up successfully."
      );

      onClassTypeSelected(classScheduleData);
    } catch (error) {
      console.error("Failed to configure class schedule:", error);
      showToast.error(
        "Failed to configure class schedule",
        "Please try again or contact support if the problem persists."
      );
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Class Type & Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Type Selection */}
          <ClassTypeSelect
            register={register}
            fieldName="classTypeId"
            options={courseOptions}
            label="Class Type"
            error={errors.classTypeId?.message}
            placeholder="Select a class type"
            required={true}
            validation={{
              required: "Please select a class type",
            }}
          />

          {/* 12 Times Fixed Schedule */}
          {classType === CLASS_TYPES.TWELVE_TIMES_FIXED && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">
                12 Times Fixed Schedule
              </h3>

              {/* Day Selection */}
              <DaySelector
                selectedDays={selectedDays}
                onToggleDay={toggleDay}
                label="Select Days"
                // Remove error prop - only show on submit
              />

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <TimeInput
                  label="Start Time"
                  register={register}
                  fieldName="fixedStartTime"
                  inputRef={fixedStartTimeRef}
                  onClick={() => fixedStartTimeRef.current?.showPicker()}
                  error={errors.fixedStartTime?.message}
                  required={true}
                  min={BUSINESS_HOURS.START}
                  max={BUSINESS_HOURS.END}
                  validation={getTimeValidationRules("start")}
                />
                <TimeInput
                  label="End Time"
                  register={register}
                  fieldName="fixedEndTime"
                  inputRef={fixedEndTimeRef}
                  onClick={() => fixedEndTimeRef.current?.showPicker()}
                  error={errors.fixedEndTime?.message}
                  required={true}
                  min={BUSINESS_HOURS.START}
                  max={BUSINESS_HOURS.END}
                  validation={getTimeValidationRules(
                    "end",
                    watch("fixedStartTime")
                  )}
                />
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
              <Calendar
                selectedDates={selectedDates}
                onToggleDate={toggleDate}
                currentDate={currentDate}
                onNavigateMonth={navigateMonth}
                calendarDays={calendarDays}
                label="Select Dates"
                maxSelectable={
                  selectedCourseOption
                    ? getRequiredCampDateCount(selectedCourseOption.classMode)
                    : undefined
                }
                classMode={selectedCourseOption?.classMode}
                // Remove error prop - only show on submit
              />

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <TimeInput
                  label="Start Time"
                  register={register}
                  fieldName="campStartTime"
                  inputRef={campStartTimeRef}
                  onClick={() => campStartTimeRef.current?.showPicker()}
                  error={errors.campStartTime?.message}
                  required={true}
                  min={BUSINESS_HOURS.START}
                  max={BUSINESS_HOURS.END}
                  validation={getTimeValidationRules("start")}
                />
                <TimeInput
                  label="End Time"
                  register={register}
                  fieldName="campEndTime"
                  inputRef={campEndTimeRef}
                  onClick={() => campEndTimeRef.current?.showPicker()}
                  error={errors.campEndTime?.message}
                  required={true}
                  min={BUSINESS_HOURS.START}
                  max={BUSINESS_HOURS.END}
                  validation={getTimeValidationRules(
                    "end",
                    watch("campStartTime")
                  )}
                />
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Next"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
