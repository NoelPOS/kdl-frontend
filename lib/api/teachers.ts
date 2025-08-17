import { Teacher } from "@/app/types/teacher.type";
import { Course } from "@/app/types/course.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function searchTeachers(query: string): Promise<Teacher[]> {
  const response = await clientApi.get<Teacher[]>(
    `/teachers/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getTeacherById(id: number): Promise<Partial<Teacher>> {
  return clientApi.get(`/teachers/${id}`).then((res) => res.data);
}

export async function updateTeacherById(id: number, data: Partial<Teacher>) {
  return clientApi.put(`/teachers/${id}`, data).then((res) => res.data);
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
  return response.data;
}

export async function fetchAllTeachers(
  accessToken?: string
): Promise<Teacher[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Teacher[]>("/teachers/all");
  return response.data;
}
