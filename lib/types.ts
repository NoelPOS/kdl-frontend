export interface Student {
  id: string;
  nickname: string;
  fullName: string;
  age: number;
  phone: string;
  avatar?: string;
  hasConsent?: boolean;
}

export interface Teacher {
  id: string;
  fullName: string;
}

export interface Course {
  id: string;
  name: string;
  ageRange: string;
  device: string;
  price: number;
  currency: string;
}

export interface ClassSession {
  id: string;
  date: string;
  time: string;
  student: Student;
  teacher: Teacher;
  course: Course;
  class: string;
  room: string;
  status?: "Completed" | "Confirmed" | "Cancelled";
  remark?: string;
  nickname: string; // Optional nickname for the student
}

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: "blue" | "orange";
  course: string;
}

// types for class schedule confirmation component
export type ComfirmStudent = {
  studentName: string;
  nickname: string;
  id: string;
};

export type ComfirmClassSession = {
  date: string;
  startTime: string;
  endTime: string;
};

export type ComfirmClassScheduleData = {
  classType: "12-times-check" | "12-times-fixed" | "camp-class" | "";
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

export type ComfirmTeacherData = {
  teacher: string;
  room: string;
  remark: string;
};

export type ComfirmScheduleRow = {
  date: string;
  time: string;
  student: string;
  teacher: string;
  class: string;
  room: string;
  remark: string;
  warning?: string;
};
