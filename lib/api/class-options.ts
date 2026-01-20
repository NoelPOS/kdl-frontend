// Class Options API
import { clientApi, createServerApi } from "./config";
import { ClassOption, CreateClassOptionDto, UpdateClassOptionDto } from "@/app/types/class-option.type";

/**
 * Get all class options (for dropdowns and selection)
 */
export async function getCourseTypes(): Promise<ClassOption[]> {
  const res = await clientApi.get<ClassOption[]>("class-options");
  return res.data;
}

/**
 * Get all class options including expired ones (for admin management)
 */
export async function getAllClassOptions(): Promise<ClassOption[]> {
  const res = await clientApi.get<ClassOption[]>("class-options");
  return res.data;
}

/**
 * Get a single class option by ID
 */
export async function getClassOptionById(id: number): Promise<ClassOption> {
  const res = await clientApi.get<ClassOption>(`/class-options/${id}`);
  return res.data;
}

/**
 * Create a new class option
 * Note: If classMode already exists (case-insensitive), the backend will 
 * auto-expire the existing option and create a new version
 */
export async function createClassOption(data: CreateClassOptionDto): Promise<ClassOption> {
  const res = await clientApi.post<ClassOption>("/class-options", data);
  return res.data;
}

/**
 * Update an existing class option
 */
export async function updateClassOption(
  id: number,
  data: UpdateClassOptionDto
): Promise<ClassOption> {
  const res = await clientApi.patch<ClassOption>(`/class-options/${id}`, data);
  return res.data;
}

/**
 * Delete a class option
 */
export async function deleteClassOption(id: number): Promise<void> {
  await clientApi.delete(`/class-options/${id}`);
}

