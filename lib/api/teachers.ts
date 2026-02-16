import { Teacher, TeacherAbsence, TeacherAvailability } from "@/app/types/teacher.type";
import { Course } from "@/app/types/course.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function searchTeachers(query: string): Promise<Teacher[]> {
  const response = await clientApi.get<Teacher[]>(
    `/teachers/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const response = await clientApi.get<Teacher[]>("/teachers/all");
  return response.data;
}

export async function getTeacherById(
  id: number,
  accessToken?: string
): Promise<Partial<Teacher>> {
  const api = accessToken ? await createServerApi(accessToken) : clientApi;
  return api.get(`/teachers/${id}`).then((res) => res.data);
}

export async function updateTeacherById(id: number, data: Partial<Teacher>) {
  return clientApi.put(`/teachers/${id}`, data).then((res) => res.data);
}

export async function deleteTeacherById(id: number): Promise<void> {
  return clientApi.patch(`/teachers/${id}/role`, { role: "none" }).then((res) => res.data);
}

export async function getTeacherByName(
  name: string
): Promise<Pick<Teacher, "id" | "name">> {
  const response = await clientApi.get<Pick<Teacher, "id" | "name">>(
    `/teachers/name/${encodeURIComponent(name)}`
  );
  return response.data;
}

export async function getTeacherByCourseId(
  courseId: number
): Promise<Pick<Teacher, "id" | "name">[]> {
  const response = await clientApi.get<Pick<Teacher, "id" | "name">[]>(
    `/teachers/course/${courseId}`
  );
  return response.data;
}

type NewTeacherData = Omit<Teacher, "id">;

export async function addNewTeacher(teacher: NewTeacherData): Promise<Teacher> {
  const response = await clientApi.post<Teacher>("/teachers", teacher);
  return response.data;
}

export async function assignCoursesToTeacher(
  teacherId: number,
  courseIds: number[]
): Promise<void> {
  await clientApi.post(`/teachers/${teacherId}/courses`, { courseIds });
}

export async function removeCourseFromTeacher(
  teacherId: number,
  courseId: number
): Promise<void> {
  await clientApi.delete(`/teachers/${teacherId}/courses/${courseId}`);
}

export async function getTeacherCourses(
  teacherId: number,
  filter: { query?: string } = {},
  page: number = 1,
  limit: number = 12
): Promise<{
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.query) params.set("query", filter.query);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await clientApi.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/teachers/${teacherId}/courses?${params.toString()}`);
  return response.data;
}

// Server-side functions
export async function fetchTeachers(
  query?: string,
  status?: string,
  course?: string,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  teachers: Teacher[];
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
  if (query) params.set("query", query);
  if (status) params.set("status", status);
  if (course) params.set("course", course);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    teachers: Teacher[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/teachers?${params.toString()}`);
  return {
    ...response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchAllTeachers(
  accessToken?: string
): Promise<Teacher[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Teacher[]>("/teachers/all");
  return response.data;
}

// ==================== TEACHER ABSENCE API ====================

export async function getTeacherAbsences(teacherId: number): Promise<TeacherAbsence[]> {
  const response = await clientApi.get<TeacherAbsence[]>(`/teachers/${teacherId}/absences`);
  return response.data;
}

export async function createTeacherAbsence(
  teacherId: number,
  data: { absenceDate: string; reason?: string }
): Promise<TeacherAbsence> {
  const response = await clientApi.post<TeacherAbsence>(`/teachers/${teacherId}/absences`, data);
  return response.data;
}

export async function updateTeacherAbsence(
  teacherId: number,
  absenceId: number,
  data: { absenceDate?: string; reason?: string }
): Promise<TeacherAbsence> {
  const response = await clientApi.patch<TeacherAbsence>(
    `/teachers/${teacherId}/absences/${absenceId}`,
    data
  );
  return response.data;
}

export async function deleteTeacherAbsence(
  teacherId: number,
  absenceId: number
): Promise<void> {
  await clientApi.delete(`/teachers/${teacherId}/absences/${absenceId}`);
}

// ==================== TEACHER AVAILABILITY API ====================

export async function checkTeacherAvailability(
  teacherId: number,
  date: string,
  startTime?: string,
  endTime?: string,
  excludeScheduleId?: number
): Promise<TeacherAvailability> {
  const params = new URLSearchParams();
  params.set("date", date);
  if (startTime) params.set("startTime", startTime);
  if (endTime) params.set("endTime", endTime);
  if (excludeScheduleId) params.set("excludeScheduleId", excludeScheduleId.toString());

  const response = await clientApi.get<TeacherAvailability>(
    `/teachers/${teacherId}/availability?${params.toString()}`
  );
  return response.data;
}
