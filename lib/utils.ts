import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  ComfirmStudent,
  ComfirmTeacherData,
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

export function generateScheduleRows(
  students: ComfirmStudent[],
  classSchedule: ComfirmClassScheduleData,
  teacherData: ComfirmTeacherData
): ComfirmScheduleRow[] {
  const rows: ComfirmScheduleRow[] = [];

  console.log("Generating schedule rows for class mode:", classSchedule);

  if (classSchedule.classType.classMode === "12 times check") {
    // For 12 times check, create 12 placeholder rows
    for (let i = 0; i < 12; i++) {
      students.forEach((student) => {
        rows.push({
          date: undefined, // Placeholder, will be set later
          time: "TBD",
          student: student.nickname || student.name,
          teacher: "TBD",
          room: "TBD",
          remark: "TBD",
          warning: "TBD",
          studentId: Number(student.id),
        });
      });
    }
  } else if (classSchedule.classType.classMode === "12 times fixed") {
    console.log("fixedDays", classSchedule.fixedDays);
    // Generate 12 sessions based on selected days
    if (classSchedule.fixedDays && classSchedule.fixedDays.length > 0) {
      const selectedDays = classSchedule.fixedDays;
      const startTime = classSchedule.fixedStartTime;
      const endTime = classSchedule.fixedEndTime;

      // Generate dates for the next 12 sessions
      const today = new Date();
      const sessionDates: string[] = [];
      const currentDate = new Date(today);

      // Find the next 12 occurrences of the selected days
      while (sessionDates.length < 12) {
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
          });
        });
      });
    }
  } else if (
    classSchedule.classType.classMode === "5 days camp" ||
    classSchedule.classType.classMode === "2 days camp"
  ) {
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
          });
        });
      });
    }
  }

  return rows;
}

// Generate calendar days
export const generateCalendarDays = (currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  // const lastDay = new Date(year, month + 1, 0);
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
