import { clientApi } from "./config";

export interface CoursePackage {
  id: number;
  name: string;
  numberOfCourses: number;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePackageData {
  name: string;
  numberOfCourses: number;
  effectiveStartDate: string;
  effectiveEndDate?: string;
}

/** Only effectiveEndDate is mutable after creation. */
export interface UpdateCoursePackageData {
  effectiveEndDate: string;
}

export async function getCoursePackages(): Promise<CoursePackage[]> {
  const res = await clientApi.get<CoursePackage[]>("/course-packages");
  return res.data;
}

export async function createCoursePackage(data: CreateCoursePackageData): Promise<CoursePackage> {
  const res = await clientApi.post<CoursePackage>("/course-packages", data);
  return res.data;
}

export async function updateCoursePackage(id: number, data: UpdateCoursePackageData): Promise<CoursePackage> {
  const res = await clientApi.patch<CoursePackage>(`/course-packages/${id}`, data);
  return res.data;
}

export async function deleteCoursePackage(id: number): Promise<void> {
  await clientApi.delete(`/course-packages/${id}`);
}
