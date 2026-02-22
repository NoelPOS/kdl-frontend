import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getTeachers,
  getTeacherById,
  getAllTeachers,
  getTeacherByCourseId,
  type TeacherListFilters,
} from "@/lib/api/teachers";

/**
 * Fetches the paginated teacher list with optional filters.
 */
export function useTeacherList(filters: TeacherListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters as Record<string, unknown>),
    queryFn: () => getTeachers(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single teacher by ID.
 */
export function useTeacherDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(String(id)),
    queryFn: () => getTeacherById(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetches all teachers (unpaginated) — used for dropdowns and selectors.
 */
export function useAllTeachers() {
  return useQuery({
    queryKey: [...queryKeys.teachers.all(), "all-flat"],
    queryFn: () => getAllTeachers(),
    staleTime: 60 * 1000,
  });
}

/**
 * Fetches teachers who teach a specific course.
 * Returns minimal data (id, name) for dropdowns.
 */
export function useTeachersByCourse(
  courseId: number | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.teachers.all(), "by-course", courseId],
    queryFn: () => getTeacherByCourseId(courseId!),
    enabled: options?.enabled !== false && courseId != null,
    staleTime: 60 * 1000,
  });
}
