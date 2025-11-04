

// Time validation constants
export const BUSINESS_HOURS = {
  START: "09:00",
  END: "17:00",
} as const;

export const isWithinBusinessHours = (time: string): boolean => {
  if (!time) return false;
  return time >= BUSINESS_HOURS.START && time <= BUSINESS_HOURS.END;
};

export const isValidTimeRange = (
  startTime: string,
  endTime: string
): boolean => {
  if (!startTime || !endTime) return false;
  return endTime > startTime;
};

export const isNotPastDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  return selectedDate >= today;
};

export const isCorrectCampDateCount = (
  classMode: string,
  selectedDates: string[]
): boolean => {
  if (classMode === "5 days camp") {
    return selectedDates.length === 5;
  } else if (classMode === "2 days camp") {
    return selectedDates.length === 2;
  }
  return true;
};

export const getRequiredCampDateCount = (classMode: string): number => {
  if (classMode === "5 days camp") return 5;
  if (classMode === "2 days camp") return 2;
  return 0;
};

export const getCampDateValidationMessage = (
  classMode: string,
  selectedCount: number
): string => {
  const required = getRequiredCampDateCount(classMode);
  if (required === 0) return "";

  if (selectedCount === 0) {
    return `Please select ${required} dates for ${classMode}`;
  } else if (selectedCount < required) {
    return `Please select ${required - selectedCount} more date${
      required - selectedCount > 1 ? "s" : ""
    } (${selectedCount}/${required} selected)`;
  } else if (selectedCount > required) {
    return `Too many dates selected. Please select only ${required} dates for ${classMode}`;
  }

  return "";
};

export const getTimeValidationRules = (
  fieldName: "start" | "end",
  otherTimeValue?: string
) => {
  const rules: any = {
    required: `${fieldName === "start" ? "Start" : "End"} time is required`,
    validate: {
      withinBusinessHours: (value: string) => {
        if (!isWithinBusinessHours(value)) {
          return "Time must be between 9:00 AM and 5:00 PM";
        }
        return true;
      },
    },
  };

  if (fieldName === "end" && otherTimeValue) {
    rules.validate.validRange = (value: string) => {
      if (!isValidTimeRange(otherTimeValue, value)) {
        return "End time must be after start time";
      }
      return true;
    };
  }

  return rules;
};

export const getTimeErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;

  if (typeof error.message === "string") {
    return error.message;
  }

  // Handle specific validation errors
  if (error.type === "required") {
    return error.message || "This field is required";
  }

  if (error.type === "withinBusinessHours") {
    return "Time must be between 9:00 AM and 5:00 PM";
  }

  if (error.type === "validRange") {
    return "End time must be after start time";
  }

  return "Invalid time";
};
