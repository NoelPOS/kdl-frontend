import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  ConflictDetail,
  Student,
  TeacherData,
} from "@/app/types/course.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon", dayIndex: 1 },
  { key: "tuesday", label: "Tue", dayIndex: 2 },
  { key: "wednesday", label: "Wed", dayIndex: 3 },
  { key: "thursday", label: "Thu", dayIndex: 4 },
  { key: "friday", label: "Fri", dayIndex: 5 },
  { key: "saturday", label: "Sat", dayIndex: 6 },
  { key: "sunday", label: "Sun", dayIndex: 0 },
];

// Helper to determine option type (same logic as in dialogs)
function getOptionType(classMode: string, optionType?: 'camp' | 'fixed' | 'check'): 'camp' | 'fixed' | 'check' {
  if (optionType) return optionType;
  // Fallback
  const name = classMode.toLowerCase();
  if (name.includes('camp')) return 'camp';
  if (name.includes('fixed') || name.includes('times')) return 'fixed';
  return 'check';
}

export function generateScheduleRows(
  students: Student[],
  classSchedule: ComfirmClassScheduleData,
  teacherData: TeacherData,
  overrideLimit?: number
): ComfirmScheduleRow[] {
  const rows: ComfirmScheduleRow[] = [];
  const { classType } = classSchedule;
  
  // Use explicit optionType if available, or fallback to name inference
  const optionType = getOptionType(classType.classMode, classType.optionType);
  const limit = overrideLimit ?? (classType.classLimit || 0);

  console.log("Generating schedule rows:", {
    classMode: classType.classMode,
    optionType,
    limit,
    studentsCount: students.length
  });

  if (optionType === 'check') {
    // Generate placeholder rows based on class limit (default to 1, or 12 if name implies)
    // Legacy support: if name has "12 times", use 12. New support: use limit.
    let count = limit;
    if (count === 0 && classType.classMode.includes("12 times")) count = 12;
    if (count === 0) count = 1; // Default to at least 1 row

    for (let i = 0; i < count; i++) {
      students.forEach((student) => {
        rows.push({
          date: undefined, 
          time: "TBD - TBD",
          student: student.nickname || student.name,
          teacher: "TBD",
          room: "TBD",
          remark: "TBD",
          warning: "TBD",
          studentId: Number(student.id),
          studentIdDisplay: student.studentId 
        });
      });
    }
  } else if (optionType === 'fixed') {
    // Generate sessions based on selected days for the duration of the limit
    if (classSchedule.fixedDays && classSchedule.fixedDays.length > 0) {
      const selectedDays = classSchedule.fixedDays;
      const startTime = classSchedule.fixedStartTime;
      const endTime = classSchedule.fixedEndTime;

      // Determine number of sessions
      let sessionCount = limit;
      if (sessionCount === 0 && classType.classMode.includes("12 times")) sessionCount = 12;
      if (sessionCount === 0) sessionCount = 12; // Fallback default

      // Generate dates for the next N sessions
      const today = new Date();
      const sessionDates: string[] = [];
      const currentDate = new Date(today);

      while (sessionDates.length < sessionCount) {
        const dayOfWeek = DAYS_OF_WEEK.find(
          (d) => d.dayIndex === currentDate.getDay()
        );
        if (dayOfWeek && selectedDays.includes(dayOfWeek.key)) {
          sessionDates.push(currentDate.toISOString().split("T")[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      sessionDates.forEach((date) => {
        students.forEach((student) => {
          rows.push({
            date: date,
            time: startTime && endTime ? `${startTime} - ${endTime}` : "TBD",
            student: student.nickname || student.name,
            teacher: teacherData.teacher,
            teacherId: teacherData.teacherId,
            room: teacherData.room,
            remark: teacherData.remark,
            attendance: "pending",
            studentId: Number(student.id), 
            studentIdDisplay: student.studentId
          });
        });
      });
    }
  } else if (optionType === 'camp') {
    // Generate sessions based on selected dates
    if (classSchedule.campDates && classSchedule.campDates.length > 0) {
      const startTime = classSchedule.campStartTime;
      const endTime = classSchedule.campEndTime;

      classSchedule.campDates.forEach((date) => {
        students.forEach((student) => {
          rows.push({
            date: date,
            time: startTime && endTime ? `${startTime} - ${endTime}` : "TBD",
            student: student.nickname || student.name,
            teacher: teacherData.teacher,
            teacherId: teacherData.teacherId,
            room: teacherData.room,
            remark: teacherData.remark,
            attendance: "pending",
            studentId: Number(student.id), 
            studentIdDisplay: student.studentId
          });
        });
      });
    }
  }

  return rows;
}


export const generateCalendarDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const generateConflictWarning = (conflict: ConflictDetail) => {
  const { conflictType, courseTitle, teacherName, studentName, room, time } =
    conflict;

  // Handle teacher unavailable (working days / absences)
  if (conflictType === "teacher_unavailable") {
    return (conflict as any).unavailableReason || `Teacher ${teacherName} is not available`;
  }

  switch (conflictType) {
    case "room":
      return `${room} is not available. There is a ${courseTitle} class at ${time}.`;
    case "teacher":
      return `Teacher ${teacherName} is not available. Teacher ${teacherName} is teaching ${courseTitle} at ${time}.`;
    case "student":
      return `Student ${studentName} is not available. Student ${studentName} is learning ${courseTitle} at ${time}.`;
    case "room_teacher":
      return `${room} is not available. Teacher ${teacherName} is teaching ${courseTitle} at ${time}.`;
    case "room_student":
      return `${room} is not available. Student ${studentName} is learning ${courseTitle} at ${time}.`;
    case "teacher_student":
      return `Teacher ${teacherName} is not available. Student ${studentName} is learning ${courseTitle} at ${time}.`;
    case "all":
      return `Room ${room} is not available. Teacher ${teacherName} is teaching ${courseTitle} at ${time}. Student ${studentName} is learning ${courseTitle} at ${time}.`;
    default:
      return `Conflict with ${courseTitle}`;
  }
};

export const formatLastUpdated = (timestamp: Date | undefined): string => {
  if (!timestamp) return "Unknown";
  
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffSecs < 60) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return timestamp.toLocaleString();
  }
};
