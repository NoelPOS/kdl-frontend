import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getStudents,
  getStudentById,
  type StudentListFilters,
} from "@/lib/api/students";

/**
 * Fetches the paginated student list with optional filters.
 *
 * staleTime: 30s — navigating back within 30s shows cached data instantly.
 * placeholderData: keeps previous page's data visible while fetching next page.
 */
export function useStudentList(filters: StudentListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.students.list(filters as Record<string, unknown>),
    queryFn: () => getStudents(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single student by ID.
 * Used on student detail/profile pages.
 */
export function useStudentDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.students.detail(String(id)),
    queryFn: () => getStudentById(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  });
}
