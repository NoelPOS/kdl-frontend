import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  ComfirmStudent,
  ComfirmTeacherData,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate schedule rows based on the data
export const generateScheduleRows = (
  students: ComfirmStudent[] = [],
  classSchedule: ComfirmClassScheduleData,
  teacherData: ComfirmTeacherData
): ComfirmScheduleRow[] => {
  const rows: ComfirmScheduleRow[] = [];
  let classNumber = 1;

  // Helper function to format time
  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Generate rows based on class type
  if (classSchedule.classType === "12-times-check") {
    // For 12 times check, create 12 sessions with sample dates
    const startDate = new Date();
    for (let i = 0; i < 12; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + i * 7); // Weekly sessions

      students.forEach((student, studentIndex) => {
        rows.push({
          date: formatDate(sessionDate.toISOString().split("T")[0]),
          time: formatTime(
            classSchedule.checkStartTime || "10:00",
            classSchedule.checkEndTime || "14:30"
          ),
          student: student.nickname || student.studentName,
          teacher: teacherData.teacher,
          class: classNumber,
          room: teacherData.room,
          remark: teacherData.remark,
          warning:
            i < 3 && studentIndex === 0
              ? "Teacher time conflict with mBot class with Jerry."
              : i === 2 && studentIndex === 1
              ? "Student time conflict with mBot class."
              : i > 8
              ? "Room conflict with Free Trial class."
              : undefined,
        });
      });
      classNumber++;
    }
  } else if (
    classSchedule.classType === "12-times-fixed" &&
    classSchedule.fixedSessions
  ) {
    // For 12 times fixed, use the specific sessions
    classSchedule.fixedSessions.forEach((session, sessionIndex) => {
      if (session.date && session.startTime && session.endTime) {
        students.forEach((student, studentIndex) => {
          rows.push({
            date: formatDate(session.date),
            time: formatTime(session.startTime, session.endTime),
            student: student.nickname || student.studentName,
            teacher: teacherData.teacher,
            class: sessionIndex + 1,
            room: teacherData.room,
            remark: teacherData.remark,
            warning:
              sessionIndex < 3 && studentIndex === 0
                ? "Teacher time conflict with mBot class with Jerry."
                : sessionIndex === 2 && studentIndex === 1
                ? "Student time conflict with mBot class."
                : sessionIndex > 8
                ? "Room conflict with Free Trial class."
                : undefined,
          });
        });
      }
    });
  } else if (
    classSchedule.classType === "camp-class" &&
    classSchedule.campSessions
  ) {
    // For camp class, use the camp sessions
    classSchedule.campSessions.forEach((session, sessionIndex) => {
      if (session.date && session.startTime && session.endTime) {
        students.forEach((student, studentIndex) => {
          rows.push({
            date: formatDate(session.date),
            time: formatTime(session.startTime, session.endTime),
            student: student.nickname || student.studentName,
            teacher: teacherData.teacher,
            class: sessionIndex + 1,
            room: teacherData.room,
            remark: teacherData.remark,
            warning:
              sessionIndex < 2 && studentIndex === 0
                ? "Teacher time conflict with mBot class with Jerry."
                : sessionIndex === 1 && studentIndex === 1
                ? "Student time conflict with mBot class."
                : undefined,
          });
        });
      }
    });
  }

  return rows.sort((a, b) => {
    // Sort by date first, then by class number
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.class - b.class;
  });
};
