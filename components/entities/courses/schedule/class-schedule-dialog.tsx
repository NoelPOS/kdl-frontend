"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { showToast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { DAYS_OF_WEEK, generateCalendarDays } from "@/lib/utils";
import { getCourseTypes } from "@/lib/api";
import { ClassOption, ComfirmClassScheduleData } from "@/app/types/course.type";
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

// Constants
const CLASS_TYPES = {
  TWELVE_TIMES_FIXED: "12 times fixed",
  FIVE_DAYS_CAMP: "5 days camp",
  TWO_DAYS_CAMP: "2 days camp",
} as const;

const VALIDATION_MESSAGES = {
  SELECT_CLASS_TYPE: "Please select a class type.",
  SELECT_DAYS_FIXED: "Please select at least one day for fixed schedule.",
} as const;

// Simplified validation for day/date selection only
const validateDayDateSelection = (
  selectedCourseType: ClassOption,
  selectedDays: string[],
  selectedDates: string[]
): boolean => {
  if (selectedCourseType.classMode === CLASS_TYPES.TWELVE_TIMES_FIXED) {
    if (selectedDays.length === 0) {
      showToast.error(VALIDATION_MESSAGES.SELECT_DAYS_FIXED);
      return false;
    }
  } else if (
    selectedCourseType.classMode === CLASS_TYPES.FIVE_DAYS_CAMP ||
    selectedCourseType.classMode === CLASS_TYPES.TWO_DAYS_CAMP
  ) {
    const requiredCount = getRequiredCampDateCount(
      selectedCourseType.classMode
    );
    if (selectedDates.length !== requiredCount) {
      const message = getCampDateValidationMessage(
        selectedCourseType.classMode,
        selectedDates.length
      );
      showToast.error(message);
      return false;
    }
  }
  return true;
};

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

interface ClassScheduleDialogProps {
  open: boolean;
  afterClassSchedule: (schedule: ComfirmClassScheduleData) => void;
  onBack?: () => void;
}

export function ClassScheduleDialog({
  open,
  afterClassSchedule,
  onBack,
}: ClassScheduleDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      classTypeId: "",
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [courseOptions, setCourseOptions] = useState<ClassOption[]>([]);

  // Refs for time inputs
  const fixedStartTimeRef = useRef<HTMLInputElement>(null);
  const fixedEndTimeRef = useRef<HTMLInputElement>(null);
  const campStartTimeRef = useRef<HTMLInputElement>(null);
  const campEndTimeRef = useRef<HTMLInputElement>(null);

  const classTypeId = watch("classTypeId");

  // Sync state with form values
  useEffect(() => {
    setValue("fixedDays", selectedDays);
  }, [selectedDays, setValue]);

  useEffect(() => {
    setValue("campDates", selectedDates);
  }, [selectedDates, setValue]);

  // Get the selected course option object
  const selectedCourseOption = useMemo(() => {
    return courseOptions?.find(
      (option) => option.id.toString() === classTypeId
    );
  }, [courseOptions, classTypeId]);

  const classType = selectedCourseOption?.classMode;

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
      // Get fresh form values to ensure we have the latest data
      const currentFormData = getValues();

      // Get the complete course type object
      const selectedCourseType = courseOptions?.find(
        (option) => option.id.toString() === data.classTypeId
      );

      if (!selectedCourseType) {
        showToast.error(VALIDATION_MESSAGES.SELECT_CLASS_TYPE);
        return;
      }

      // Validate day/date selection (not covered by form validation)
      const isValid = validateDayDateSelection(
        selectedCourseType,
        selectedDays,
        selectedDates
      );

      if (!isValid) return;

      // Update form data with selected days/dates and complete course object
      const updatedData = {
        classType: selectedCourseType,
        fixedDays: selectedDays,
        fixedStartTime: currentFormData.fixedStartTime,
        fixedEndTime: currentFormData.fixedEndTime,
        campDates: selectedDates,
        campStartTime: currentFormData.campStartTime,
        campEndTime: currentFormData.campEndTime,
      };

      console.log("Sending updated data:", updatedData);

      // Show success toast
      showToast.success(
        "Class schedule created!",
        "Your class schedule has been configured successfully."
      );

      afterClassSchedule(updatedData);
    } catch (error) {
      console.error("Failed to create class schedule:", error);
      showToast.error(
        "Failed to create class schedule",
        "Please try again or contact support if the problem persists."
      );
    }
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
    <Dialog open={open}>
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

              {/* 12 Times Fixed - Day selection with start/end time */}
              {classType === CLASS_TYPES.TWELVE_TIMES_FIXED && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    12 Times Fixed Schedule
                  </h3>

                  <DaySelector
                    selectedDays={selectedDays}
                    onToggleDay={toggleDay}
                    label="Select Days"
                    error={
                      selectedDays.length === 0
                        ? "Please select at least one day"
                        : undefined
                    }
                  />

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
                          (day) =>
                            DAYS_OF_WEEK.find((d) => d.key === day)?.label
                        )
                        .join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Camp Class - Calendar selection with start/end time */}
              {(classType === CLASS_TYPES.FIVE_DAYS_CAMP ||
                classType === CLASS_TYPES.TWO_DAYS_CAMP) && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    Camp Class Schedule
                  </h3>

                  <Calendar
                    selectedDates={selectedDates}
                    onToggleDate={toggleDate}
                    currentDate={currentDate}
                    onNavigateMonth={navigateMonth}
                    calendarDays={calendarDays}
                    label="Select Dates"
                    maxSelectable={
                      selectedCourseOption
                        ? getRequiredCampDateCount(
                            selectedCourseOption.classMode
                          )
                        : undefined
                    }
                    classMode={selectedCourseOption?.classMode}
                    error={
                      selectedCourseOption
                        ? getCampDateValidationMessage(
                            selectedCourseOption.classMode,
                            selectedDates.length
                          )
                        : undefined
                    }
                  />

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
                disabled={isSubmitting}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClassScheduleDialog;
