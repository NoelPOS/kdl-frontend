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
