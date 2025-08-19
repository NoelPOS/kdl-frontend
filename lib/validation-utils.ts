/**
 * Validation utilities for schedule components
 */

// Time validation constants
export const BUSINESS_HOURS = {
  START: "09:00",
  END: "17:00",
} as const;

/**
 * Validates if a time is within business hours (9 AM to 5 PM)
 * @param time - Time string in HH:MM format
 * @returns boolean
 */
export const isWithinBusinessHours = (time: string): boolean => {
  if (!time) return false;
  return time >= BUSINESS_HOURS.START && time <= BUSINESS_HOURS.END;
};

/**
 * Validates if end time is after start time
 * @param startTime - Start time string in HH:MM format
 * @param endTime - End time string in HH:MM format
 * @returns boolean
 */
export const isValidTimeRange = (
  startTime: string,
  endTime: string
): boolean => {
  if (!startTime || !endTime) return false;
  return endTime > startTime;
};

/**
 * Validates if a date is not in the past
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns boolean
 */
export const isNotPastDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  return selectedDate >= today;
};

/**
 * Validates if the correct number of dates are selected for camp types
 * @param classMode - The class mode (e.g., "5 days camp", "2 days camp")
 * @param selectedDates - Array of selected date strings
 * @returns boolean
 */
export const isCorrectCampDateCount = (
  classMode: string,
  selectedDates: string[]
): boolean => {
  if (classMode === "5 days camp") {
    return selectedDates.length === 5;
  } else if (classMode === "2 days camp") {
    return selectedDates.length === 2;
  }
  return true; // For non-camp types, any number is valid
};

/**
 * Get the required number of dates for a camp type
 * @param classMode - The class mode
 * @returns number
 */
export const getRequiredCampDateCount = (classMode: string): number => {
  if (classMode === "5 days camp") return 5;
  if (classMode === "2 days camp") return 2;
  return 0;
};

/**
 * Get validation message for camp date selection
 * @param classMode - The class mode
 * @param selectedCount - Number of currently selected dates
 * @returns string
 */
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

/**
 * Time validation rules for react-hook-form
 */
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

  // Add time range validation for end time
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

/**
 * Get validation error message for time input
 * @param error - Error object from react-hook-form
 * @returns string | undefined
 */
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
