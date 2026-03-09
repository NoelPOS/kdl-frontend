"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useCourseTypes } from "@/hooks/query/use-courses";
import { ClassOption, ComfirmClassScheduleData } from "@/app/types/course.type";
import { DAYS_OF_WEEK, generateCalendarDays } from "@/lib/utils";
import {
  Calendar,
  DaySelector,
  TimeInput,
  ClassTypeSelect,
} from "@/components/shared/schedule";
import { Calendar22 } from "@/components/shared/schedule/date-picker";
import {
  getTimeValidationRules,
  BUSINESS_HOURS,
  getRequiredCampDateCount,
} from "@/lib/validation-utils";
import type { StepPanelProps } from "../types";

function getOptionType(option: ClassOption | undefined): "camp" | "fixed" | "check" {
  if (!option) return "check";
  if (option.optionType) return option.optionType;
  const name = option.classMode.toLowerCase();
  if (name.includes("camp")) return "camp";
  if (name.includes("fixed") || name.includes("times")) return "fixed";
  return "check";
}

type FormData = {
  classTypeId: string;
  fixedStartTime?: string;
  fixedEndTime?: string;
  fixedStartDate?: string;
  campStartTime?: string;
  campEndTime?: string;
};

interface Step3Props extends StepPanelProps {
  courseId?: number;
  /** Called when step 3 data is fully valid and submitted within the panel */
  onClassScheduleReady?: (schedule: ComfirmClassScheduleData) => void;
}

export function Step3ClassType({
  data,
  onChange,
  onValidChange,
  onClassScheduleReady,
}: Step3Props) {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      classTypeId: data.classOptionId?.toString() || "",
      fixedStartTime: data.scheduleData?.fixedStartTime || "",
      fixedEndTime: data.scheduleData?.fixedEndTime || "",
      fixedStartDate: data.scheduleData?.fixedStartDate || "",
      campStartTime: data.scheduleData?.campStartTime || "",
      campEndTime: data.scheduleData?.campEndTime || "",
    },
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(
    data.scheduleData?.fixedDays || []
  );
  const [selectedDates, setSelectedDates] = useState<string[]>(
    data.scheduleData?.campDates || []
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const { data: courseOptions = [] } = useCourseTypes();

  const fixedStartTimeRef = useRef<HTMLInputElement>(null);
  const fixedEndTimeRef = useRef<HTMLInputElement>(null);
  const campStartTimeRef = useRef<HTMLInputElement>(null);
  const campEndTimeRef = useRef<HTMLInputElement>(null);

  const classTypeId = watch("classTypeId");
  const fixedStartTime = watch("fixedStartTime");
  const fixedEndTime = watch("fixedEndTime");
  const campStartTime = watch("campStartTime");
  const campEndTime = watch("campEndTime");

  const selectedCourseOption = useMemo(() => {
    return courseOptions?.find(
      (option) => option.id.toString() === classTypeId
    );
  }, [courseOptions, classTypeId]);

  const optionType = getOptionType(selectedCourseOption);

  // Validate and sync to parent on changes
  const validate = useCallback(() => {
    if (!selectedCourseOption) {
      onValidChange(false);
      return;
    }

    if (optionType === "check") {
      onValidChange(true);
      return;
    }

    if (optionType === "fixed") {
      const valid =
        selectedDays.length > 0 &&
        !!fixedStartTime &&
        !!fixedEndTime;
      onValidChange(valid);
      return;
    }

    if (optionType === "camp") {
      const requiredCount = getRequiredCampDateCount(
        selectedCourseOption.classMode,
        selectedCourseOption.classLimit
      );
      const valid =
        selectedDates.length === requiredCount &&
        !!campStartTime &&
        !!campEndTime;
      onValidChange(valid);
      return;
    }

    onValidChange(false);
  }, [
    selectedCourseOption,
    optionType,
    selectedDays.length,
    selectedDates.length,
    fixedStartTime,
    fixedEndTime,
    campStartTime,
    campEndTime,
    onValidChange,
  ]);

  useEffect(() => {
    validate();
  }, [validate]);

  // Sync data to parent whenever form values change
  useEffect(() => {
    if (!selectedCourseOption) return;

    onChange({
      classOptionId: selectedCourseOption.id,
      classOptionData: selectedCourseOption,
      scheduleData: {
        fixedDays: selectedDays,
        fixedStartTime: fixedStartTime || undefined,
        fixedEndTime: fixedEndTime || undefined,
        fixedStartDate: getValues("fixedStartDate") || undefined,
        campDates: selectedDates,
        campStartTime: campStartTime || undefined,
        campEndTime: campEndTime || undefined,
      },
    });
  }, [
    selectedCourseOption,
    selectedDays,
    selectedDates,
    fixedStartTime,
    fixedEndTime,
    campStartTime,
    campEndTime,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build the ComfirmClassScheduleData for the wizard to use
  useEffect(() => {
    if (!selectedCourseOption || !onClassScheduleReady) return;

    const schedule: ComfirmClassScheduleData = {
      classType: selectedCourseOption,
      fixedDays: selectedDays,
      fixedStartTime: fixedStartTime,
      fixedEndTime: fixedEndTime,
      fixedStartDate: getValues("fixedStartDate") || undefined,
      campDates: selectedDates,
      campStartTime: campStartTime,
      campEndTime: campEndTime,
    };
    onClassScheduleReady(schedule);
  }, [
    selectedCourseOption,
    selectedDays,
    selectedDates,
    fixedStartTime,
    fixedEndTime,
    campStartTime,
    campEndTime,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate),
    [currentDate]
  );

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentDate);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newMonth);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Class Type & Schedule
        </h3>
        <p className="text-sm text-muted-foreground">
          Select the class type and configure the schedule.
        </p>
      </div>

      {/* Class Type Select */}
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

      {/* Fixed Schedule */}
      {optionType === "fixed" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900">Fixed Schedule</h4>

          <DaySelector
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            label="Select Days"
          />

          {/* Start Date picker */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Start Date{" "}
              <span className="text-gray-400 font-normal">
                (optional — defaults to today)
              </span>
            </label>
            <Calendar22
              date={
                watch("fixedStartDate")
                  ? new Date(watch("fixedStartDate") as string)
                  : undefined
              }
              onChange={(date) => {
                if (date) {
                  const offset = date.getTimezoneOffset();
                  const adjustedDate = new Date(
                    date.getTime() - offset * 60 * 1000
                  );
                  setValue(
                    "fixedStartDate",
                    adjustedDate.toISOString().split("T")[0]
                  );
                } else {
                  setValue("fixedStartDate", "");
                }
              }}
            />
          </div>

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
              validation={getTimeValidationRules("end", fixedStartTime)}
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
      {optionType === "camp" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900">Camp Class Schedule</h4>

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
                    selectedCourseOption.classMode,
                    selectedCourseOption.classLimit
                  )
                : undefined
            }
            classMode={selectedCourseOption?.classMode}
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
              validation={getTimeValidationRules("end", campStartTime)}
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

      {/* Check type info */}
      {optionType === "check" && selectedCourseOption && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>{selectedCourseOption.classMode}</strong> — No schedule
            configuration needed. Teacher and room will be skipped.
          </p>
        </div>
      )}
    </div>
  );
}
