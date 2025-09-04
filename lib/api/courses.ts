import { Course } from "@/app/types/course.type";
import { clientApi, createServerApi } from "./config";

export interface CourseFilter {
  query?: string;
  ageRange?: string;
  medium?: string;
}

// Client-side functions
export async function searchCourses(query: string): Promise<Course[]> {
  const response = await clientApi.get<Course[]>(
    `/courses/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getCourseIdByCourseName(name: string): Promise<Course> {
  const response = await clientApi.get<Course>(`/courses/${name}`);
  return response.data;
}

type NewCourseData = Omit<Course, "id">;

export async function addNewCourse(course: NewCourseData): Promise<Course> {
  try {
    const response = await clientApi.post<Course>("/courses", course);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create course:", error);
    throw error;
  }
}

// Server-side functions
export async function fetchFilteredCourses(
  filter: CourseFilter = {},
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  courses: Course[];
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
  if (filter.query) params.set("query", filter.query);
  if (filter.ageRange) params.set("ageRange", filter.ageRange);
  if (filter.medium) params.set("medium", filter.medium);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/courses/filter?${params.toString()}`);
  return {
    ...response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchCourses(
  page: number = 1,
  limit: number = 10,
  accessToken?: string
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
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/courses?${params.toString()}`);
  return response.data;
}

export async function fetchAllCourses(accessToken?: string): Promise<Course[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Course[]>("/courses/all");
  return response.data;
}
