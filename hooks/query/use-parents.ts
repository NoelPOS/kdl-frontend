import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getParents,
  getParentById,
  searchParents,
  type ParentListFilters,
} from "@/lib/api/parents";

/**
 * Fetches the filtered + paginated parent list.
 */
export function useParentList(filters: ParentListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.parents.list(filters as Record<string, unknown>),
    queryFn: () => getParents(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single parent by ID.
 */
export function useParentDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.parents.detail(String(id)),
    queryFn: () => getParentById(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  });
}

/**
 * Searches for parents by name query.
 * Used in autocomplete/search fields.
 */
export function useSearchParents(
  query: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.parents.all(), "search", query],
    queryFn: () => searchParents(query),
    enabled: options?.enabled !== false && query.length > 0,
    staleTime: 30 * 1000,
  });
}
