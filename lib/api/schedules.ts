import { ClassSchedule } from "@/app/types/schedule.type";
import { ConflictDetail } from "@/app/types/course.type";
import { clientApi, createServerApi } from "./config";

export interface Schedule {
  date?: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId?: number;
  courseId: number;
  studentId: number;
  feedbackModifiedByName?: string;
  feedbackModifiedAt?: string;
}

export interface ScheduleConflictCheck {
  date?: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId?: number;
  studentId: number;
  excludeId?: number;
}

export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  studentName?: string;
  teacherName?: string;
  courseName?: string;
  attendanceStatus?: string;
  classStatus?: string;
  room?: string;
  sessionMode?: string;
  sort?: string;
  classOption?: string;
}

interface ScheduleUpdate {
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  teacherId?: number;
  courseId?: number;
  studentId?: number;
  attendance?: string;
  remark?: string;
  feedback?: string; // Teacher feedback field
  feedbackDate?: string; // When feedback was submitted
}

interface BatchScheduleCheck {
  schedules: ScheduleConflictCheck[];
}

// Client-side functions
export async function createBulkSchedules(
  schedules: Schedule[]
): Promise<{ created: number }> {
  const res = await clientApi.post<{ created: number }>(
    "/schedules/bulk",
    schedules
  );
  return res.data;
}

export async function checkScheduleConflict(
  params: ScheduleConflictCheck
): Promise<ConflictDetail> {
  const res = await clientApi.post<ConflictDetail>(
    "/schedules/conflict",
    params
  );
  // console.log("Conflict check result:", res.data);
  return res.data;
}

export async function checkScheduleConflicts(
  batch: BatchScheduleCheck
): Promise<ConflictDetail[]> {

  if (process.env.NODE_ENV !== "production") {
    console.log("Batch conflict check input:", batch);
  }

  const res = await clientApi.post<ConflictDetail[]>(
    "/schedules/conflicts",
    batch
  );
  
  if (process.env.NODE_ENV !== "production") {
    console.log("Batch conflict check result:", res.data);
  }
  
  return res.data;
}

export async function updateSchedule(
  scheduleId: number,
  data: ScheduleUpdate
): Promise<Schedule> {
  const res = await clientApi.patch<Schedule>(`/schedules/${scheduleId}`, data);
  return res.data;
}

export async function getSchedulesByStudentAndSession(
  sessionId: number,
  studentId: number,
  accessToken?: string
): Promise<ClassSchedule[]> {
  const api = await createServerApi(accessToken);
  const res = await api.get<ClassSchedule[]>(
    `/schedules/session/${sessionId}/student/${studentId}`
  );
  
  if (process.env.NODE_ENV !== "production") {
    console.log("API response:", res.data);
  }
  
  return res.data;
}

export async function getSchedulesBySession(
  sessionId: number,
  accessToken?: string
): Promise<ClassSchedule[]> {
  const api = await createServerApi(accessToken);
  const res = await api.get<ClassSchedule[]>(`/schedules/session/${sessionId}`);
  console.log("API response:", res.data);
  return res.data;
}

// Server-side functions
export async function getTodaySchedules(
  accessToken: string
): Promise<{ schedules: ClassSchedule[], lastUpdated?: Date }> {
  const api = await createServerApi(accessToken);
  const res = await api.get<ClassSchedule[]>("/schedules/today");
  return {
    schedules: res.data,
    lastUpdated: res.lastFetched
  };
}

export async function getAllSchedules(
  accessToken?: string
): Promise<ClassSchedule[]> {
  const api = await createServerApi(accessToken);
  const res = await api.get<ClassSchedule[]>("/schedules");
  return res.data;
}

export async function getFilteredSchedules(
  data: ScheduleFilter,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  schedules: ClassSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (data.startDate) params.set("startDate", data.startDate);
  if (data.endDate) params.set("endDate", data.endDate);
  if (data.studentName) params.set("studentName", data.studentName);
  if (data.teacherName) params.set("teacherName", data.teacherName);
  if (data.courseName) params.set("courseName", data.courseName);
  if (data.attendanceStatus)
    params.set("attendanceStatus", data.attendanceStatus);
  if (data.classStatus) params.set("classStatus", data.classStatus);
  if (data.room) params.set("room", data.room);
  if (data.sort) params.set("sort", data.sort);
  if (data.classOption) params.set("classOption", data.classOption);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  console.log("API call URL:", `/schedules/filter?${params.toString()}`);
  console.log("Pagination params:", { page, limit });

  const res = await api.get<{
    schedules: ClassSchedule[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/schedules/filter?${params.toString()}`);
  console.log("API response:", res.data);
  return {
    ...res.data,
    lastUpdated: res.lastFetched
  };
}
