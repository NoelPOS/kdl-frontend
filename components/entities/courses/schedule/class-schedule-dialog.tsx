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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, ChevronDown } from "lucide-react";

import { DAYS_OF_WEEK, generateCalendarDays } from "@/lib/utils";
import { getCourseTypes } from "@/lib/axio";
import { ClassOption, ComfirmClassScheduleData } from "@/app/types/course.type";

// Constants
const CLASS_TYPES = {
  TWELVE_TIMES_FIXED: "12 times fixed",
  FIVE_DAYS_CAMP: "5 days camp",
  TWO_DAYS_CAMP: "2 days camp",
} as const;

const VALIDATION_MESSAGES = {
  SELECT_CLASS_TYPE: "Please select a class type.",
  SELECT_DAYS_FIXED: "Please select at least one day for 12 times fixed.",
  SELECT_TIMES_FIXED:
    "Please select both start and end times for 12 times fixed.",
  SELECT_DATES_CAMP: "Please select at least one date for camp class.",
  SELECT_TIMES_CAMP: "Please select both start and end times for camp class.",
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

// Helper Components
interface TimeInputProps {
  label: string;
  register: any;
  fieldName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClick: () => void;
}

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  register,
  fieldName,
  inputRef,
  onClick,
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-gray-500">{label}</Label>
    <div className="relative cursor-pointer" onClick={onClick}>
      <Input
        {...register(fieldName)}
        ref={(e) => {
          register(fieldName).ref(e);
          if (e) inputRef.current = e;
        }}
        type="time"
        className="border-gray-300 rounded-lg pr-10 cursor-pointer"
      />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

interface DaySelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-gray-700">Select Days</Label>
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map((day) => (
        <Button
          key={day.key}
          type="button"
          variant="outline"
          className={`h-10 text-xs cursor-pointer ${
            selectedDays.includes(day.key)
              ? "bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onToggleDay(day.key)}
        >
          {day.label}
        </Button>
      ))}
    </div>
  </div>
);

interface CalendarProps {
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
  calendarDays: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDates,
  onToggleDate,
  currentDate,
  onNavigateMonth,
  calendarDays,
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-gray-700">Select Dates</Label>
    <div className="border border-gray-300 rounded-lg p-3 bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onNavigateMonth("prev")}
        >
          ←
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
          →
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
          const dateStr = date.toISOString().split("T")[0];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isSelected = selectedDates.includes(dateStr);
          const isToday = date.toDateString() === new Date().toDateString();

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
              onClick={() => isCurrentMonth && onToggleDate(dateStr)}
              disabled={!isCurrentMonth}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  </div>
);

// Validation Functions
const validateFixedSchedule = (
  selectedDays: string[],
  formData: FormData
): boolean => {
  if (selectedDays.length === 0) {
    alert(VALIDATION_MESSAGES.SELECT_DAYS_FIXED);
    return false;
  }
  if (!formData.fixedStartTime || !formData.fixedEndTime) {
    alert(VALIDATION_MESSAGES.SELECT_TIMES_FIXED);
    return false;
  }
  return true;
};

const validateCampSchedule = (
  selectedDates: string[],
  formData: FormData
): boolean => {
  if (selectedDates.length === 0) {
    alert(VALIDATION_MESSAGES.SELECT_DATES_CAMP);
    return false;
  }
  if (!formData.campStartTime || !formData.campEndTime) {
    alert(VALIDATION_MESSAGES.SELECT_TIMES_CAMP);
    return false;
  }
  return true;
};

const validateClassSchedule = (
  selectedCourseType: ClassOption,
  selectedDays: string[],
  selectedDates: string[],
  formData: FormData
): boolean => {
  if (selectedCourseType.classMode === CLASS_TYPES.TWELVE_TIMES_FIXED) {
    return validateFixedSchedule(selectedDays, formData);
  } else if (
    selectedCourseType.classMode === CLASS_TYPES.FIVE_DAYS_CAMP ||
    selectedCourseType.classMode === CLASS_TYPES.TWO_DAYS_CAMP
  ) {
    return validateCampSchedule(selectedDates, formData);
  }
  return true;
};

// Schedule Section Components
interface FixedScheduleSectionProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
  register: any;
  fixedStartTimeRef: React.RefObject<HTMLInputElement | null>;
  fixedEndTimeRef: React.RefObject<HTMLInputElement | null>;
}

const FixedScheduleSection: React.FC<FixedScheduleSectionProps> = ({
  selectedDays,
  onToggleDay,
  register,
  fixedStartTimeRef,
  fixedEndTimeRef,
}) => (
  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
    <h3 className="font-medium text-gray-900">12 Times Fixed Schedule</h3>

    <DaySelector selectedDays={selectedDays} onToggleDay={onToggleDay} />

    <div className="grid grid-cols-2 gap-4">
      <TimeInput
        label="Start Time"
        register={register}
        fieldName="fixedStartTime"
        inputRef={fixedStartTimeRef}
        onClick={() => fixedStartTimeRef.current?.showPicker()}
      />
      <TimeInput
        label="End Time"
        register={register}
        fieldName="fixedEndTime"
        inputRef={fixedEndTimeRef}
        onClick={() => fixedEndTimeRef.current?.showPicker()}
      />
    </div>

    {selectedDays.length > 0 && (
      <div className="text-sm text-gray-600">
        Selected days:{" "}
        {selectedDays
          .map((day) => DAYS_OF_WEEK.find((d) => d.key === day)?.label)
          .join(", ")}
      </div>
    )}
  </div>
);

interface CampScheduleSectionProps {
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
  calendarDays: Date[];
  register: any;
  campStartTimeRef: React.RefObject<HTMLInputElement | null>;
  campEndTimeRef: React.RefObject<HTMLInputElement | null>;
}

const CampScheduleSection: React.FC<CampScheduleSectionProps> = ({
  selectedDates,
  onToggleDate,
  currentDate,
  onNavigateMonth,
  calendarDays,
  register,
  campStartTimeRef,
  campEndTimeRef,
}) => (
  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
    <h3 className="font-medium text-gray-900">Camp Class Schedule</h3>

    <Calendar
      selectedDates={selectedDates}
      onToggleDate={onToggleDate}
      currentDate={currentDate}
      onNavigateMonth={onNavigateMonth}
      calendarDays={calendarDays}
    />

    <div className="grid grid-cols-2 gap-4">
      <TimeInput
        label="Start Time"
        register={register}
        fieldName="campStartTime"
        inputRef={campStartTimeRef}
        onClick={() => campStartTimeRef.current?.showPicker()}
      />
      <TimeInput
        label="End Time"
        register={register}
        fieldName="campEndTime"
        inputRef={campEndTimeRef}
        onClick={() => campEndTimeRef.current?.showPicker()}
      />
    </div>

    {selectedDates.length > 0 && (
      <div className="text-sm text-gray-600">
        Selected dates: {selectedDates.length} day
        {selectedDates.length !== 1 ? "s" : ""}
      </div>
    )}
  </div>
);

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
    formState: { errors },
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

  const onSubmit = (data: FormData) => {
    // Get fresh form values to ensure we have the latest data
    const currentFormData = getValues();

    // Get the complete course type object
    const selectedCourseType = courseOptions?.find(
      (option) => option.id.toString() === data.classTypeId
    );

    if (!selectedCourseType) {
      alert(VALIDATION_MESSAGES.SELECT_CLASS_TYPE);
      return;
    }

    // Validate the schedule using our validation helper
    const isValid = validateClassSchedule(
      selectedCourseType,
      selectedDays,
      selectedDates,
      currentFormData
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
    afterClassSchedule(updatedData);
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
                      courseOptions.map((option: ClassOption) => (
                        <option key={option.id} value={option.id.toString()}>
                          {option.classMode}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 12 Times Fixed - Day selection with start/end time */}
              {classType === CLASS_TYPES.TWELVE_TIMES_FIXED && (
                <FixedScheduleSection
                  selectedDays={selectedDays}
                  onToggleDay={toggleDay}
                  register={register}
                  fixedStartTimeRef={fixedStartTimeRef}
                  fixedEndTimeRef={fixedEndTimeRef}
                />
              )}

              {/* Camp Class - Calendar selection with start/end time */}
              {(classType === CLASS_TYPES.FIVE_DAYS_CAMP ||
                classType === CLASS_TYPES.TWO_DAYS_CAMP) && (
                <CampScheduleSection
                  selectedDates={selectedDates}
                  onToggleDate={toggleDate}
                  currentDate={currentDate}
                  onNavigateMonth={navigateMonth}
                  calendarDays={calendarDays}
                  register={register}
                  campStartTimeRef={campStartTimeRef}
                  campEndTimeRef={campEndTimeRef}
                />
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

export default ClassScheduleDialog;
