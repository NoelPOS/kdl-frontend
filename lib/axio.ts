import axios from "axios";
import type { Teacher } from "./types";
import { ClassSchedule } from "@/app/types/schedule.type";
import { ConflictDetail, Course } from "@/app/types/course.type";
import { Student } from "@/app/types/student.type";
import { SessionOverview } from "@/app/types/session.type";

// Extend axios config to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: Date };
  }
}

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and performance monitoring
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    if (duration > 2000) {
      console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
    }

    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export async function fetchStudents(): Promise<{ students: Student[] }> {
  const response = await api.get<{ students: Student[] }>("/users/students");
  return response.data;
}

export async function searchStudents(query: string): Promise<Student[]> {
  const response = await api.get<Student[]>(
    `/users/students/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getStudentById(id: number): Promise<Partial<Student>> {
  const response = await api.get<Partial<Student>>(`/users/students/${id}`);
  return response.data;
}

type NewStudentData = Omit<Student, "id">;

export async function addNewStudent(student: NewStudentData): Promise<Student> {
  const response = await api.post<Student>("/users/students", student);
  return response.data;
}

export async function fetchActiveStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>("/users/students/active");
  return response.data;
}

export async function fetchInactiveStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>("/users/students/inactive");
  return response.data;
}

type NewCourseData = Omit<Course, "id">;

export async function addNewCourse(course: NewCourseData): Promise<Course> {
  const response = await api.post<Course>("/courses", course);
  return response.data;
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await api.get<Course[]>("/courses");
  return response.data;
}

export async function searchCourses(query: string): Promise<Course[]> {
  const res = await api.get<Course[]>(`/courses/${query}`);
  return res.data;
}

export async function getCourseIdByCourseName(name: string): Promise<Course> {
  const response = await api.get<Course>(`/courses/${name}`);
  return response.data;
}

export async function getTeacherByCourseId(
  courseId: number
): Promise<Teacher[]> {
  const response = await api.get<Teacher[]>(
    `/users/teachers/course/${courseId}`
  );
  return response.data;
}

export async function getTeacherByName(name: string): Promise<Teacher> {
  const response = await api.get<Teacher>(
    `/users/teachers/name/${encodeURIComponent(name)}`
  );
  return response.data;
}

interface Schedule {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: number;
  courseId: number;
  studentId: number;
}

export async function createBulkSchedules(
  schedules: Schedule[]
): Promise<{ created: number }> {
  const res = await api.post<{ created: number }>("/schedules/bulk", schedules);
  return res.data;
}

interface ScheduleConflictCheck {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: number;
  studentId: number;
}

export async function checkScheduleConflict(
  params: ScheduleConflictCheck
): Promise<ConflictDetail> {
  const res = await api.post<ConflictDetail>("/schedules/conflict", params);
  return res.data;
}

interface BatchScheduleCheck {
  schedules: ScheduleConflictCheck[];
}

export async function checkScheduleConflicts(
  batch: BatchScheduleCheck
): Promise<ConflictDetail[]> {
  const res = await api.post<ConflictDetail[]>("/schedules/conflicts", batch);
  return res.data;
}

export async function getAllSchedules(): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>("/schedules");
  return res.data;
}

interface ScheduleUpdate {
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  teacherId?: number;
  courseId?: number;
  studentId?: number;
}

export async function updateSchedule(
  scheduleId: number,
  data: ScheduleUpdate
): Promise<Schedule> {
  const res = await api.patch<Schedule>(`/schedules/${scheduleId}`, data);
  return res.data;
}

export async function getTodaySchedules(): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>("/schedules/today");
  return res.data;
}

interface ScheduleFilter {
  startDate: string;
  endDate: string;
  studentName: string;
}

export async function getFilteredSchedules(
  data: ScheduleFilter
): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>(
    `/schedules/filter?startDate=${data.startDate}&&endDate=${data.endDate}&studentName=${data.studentName}`
  );
  return res.data;
}

export async function getSchedulesByStudentAndSession(
  sessionId: number,
  studentId: number
): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>(
    `/schedules/session/${sessionId}/student/${studentId}`
  );
  return res.data;
}

interface SessionData {
  studentId: number;
  courseId: number;
  mode: string;
  classLimit: number;
  classCancel: number;
  payment: string;
  status: string;
}

export async function createSession(
  data: SessionData
): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/sessions", data);
  return res.data;
}

export async function getStudentSession(
  studentId: number
): Promise<SessionOverview[]> {
  const res = await api.get<SessionOverview[]>(
    `/sessions/overview/${studentId}`
  );
  return res.data;
}

export async function fetchFilteredCourses(
  ageRange: string,
  medium: string
): Promise<Course[]> {
  const response = await api.get<Course[]>(
    `/courses/filter?ageRange=${encodeURIComponent(
      ageRange
    )}&medium=${encodeURIComponent(medium)}`
  );
  return response.data;
}
