import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getFilteredCoursesClient,
  searchCourses,
  type CourseFilter,
} from "@/lib/api/courses";
import { getCourseTypes } from "@/lib/api/class-options";

export interface CourseListFilters extends CourseFilter {
  page?: number;
  limit?: number;
}

/**
 * Fetches the filtered + paginated course list.
 */
export function useCourseList(filters: CourseListFilters = {}) {
  const { page = 1, limit = 10, ...filter } = filters;
  return useQuery({
    queryKey: queryKeys.courses.list(filters as Record<string, unknown>),
    queryFn: () => getFilteredCoursesClient(filter, page, limit),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Searches for courses by name query.
 * Used in autocomplete/search fields.
 */
export function useSearchCourses(
  query: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.courses.all(), "search", query],
    queryFn: () => searchCourses(query),
    enabled: options?.enabled !== false && query.length > 0,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetches all course types/class options (Fixed, Camp, Check, etc.).
 * Alias for getAllClassOptions — kept for semantic clarity in course contexts.
 */
export function useCourseTypes() {
  return useQuery({
    queryKey: queryKeys.classOptions.list(),
    queryFn: () => getCourseTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
